#!/usr/bin/env bash
# =============================================================
# CVPro225 — préparation d'un VPS Ubuntu vierge (22.04 / 24.04)
#
# À lancer en root, une seule fois (ré-exécutable sans risque) :
#   scp infra/server/setup.sh root@IP_DU_SERVEUR:/root/
#   ssh root@IP_DU_SERVEUR 'bash /root/setup.sh'
#
# Variables optionnelles :
#   DEPLOY_USER=deploy        nom de l'utilisateur de déploiement
#   DEPLOY_PUBKEY="ssh-ed25519 AAAA… toi@mac"
#                             clé publique ; sinon copie /root/.ssh/authorized_keys
#   APP_DIR=/srv/cvpro225     dossier de l'application
#   HARDEN_SSH=1              désactive login root + mots de passe SSH
#                             (uniquement si deploy a une clé valide)
#   SWAP_SIZE=2G              swap créé si absent et RAM < 4 Go (0 = jamais)
# =============================================================
set -Eeuo pipefail

DEPLOY_USER="${DEPLOY_USER:-deploy}"
DEPLOY_PUBKEY="${DEPLOY_PUBKEY:-}"
APP_DIR="${APP_DIR:-/srv/cvpro225}"
HARDEN_SSH="${HARDEN_SSH:-1}"
SWAP_SIZE="${SWAP_SIZE:-2G}"

log()  { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m[!] %s\033[0m\n' "$*"; }
die()  { printf '\033[1;31m[x] %s\033[0m\n' "$*" >&2; exit 1; }
trap 'die "Échec ligne $LINENO : $BASH_COMMAND"' ERR

[[ $EUID -eq 0 ]] || die "À lancer en root."
. /etc/os-release
[[ "${ID:-}" == "ubuntu" ]] || die "Ubuntu requis (détecté : ${ID:-inconnu})."
export DEBIAN_FRONTEND=noninteractive

# ---------- 1. Mises à jour + paquets de base ----------
log "Mise à jour du système"
apt-get update -q
apt-get -y -q -o Dpkg::Options::=--force-confdef -o Dpkg::Options::=--force-confold upgrade
apt-get -y -q install ca-certificates curl gnupg git ufw fail2ban unattended-upgrades
dpkg-reconfigure -f noninteractive unattended-upgrades   # MAJ de sécurité automatiques

# ---------- 2. Utilisateur deploy ----------
log "Utilisateur ${DEPLOY_USER}"
if ! id "$DEPLOY_USER" &>/dev/null; then
  adduser --disabled-password --gecos "" "$DEPLOY_USER"
fi
usermod -aG sudo "$DEPLOY_USER"

install -d -m 700 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "/home/${DEPLOY_USER}/.ssh"
AUTH_KEYS="/home/${DEPLOY_USER}/.ssh/authorized_keys"
touch "$AUTH_KEYS"
if [[ -n "$DEPLOY_PUBKEY" ]]; then
  grep -qxF "$DEPLOY_PUBKEY" "$AUTH_KEYS" || echo "$DEPLOY_PUBKEY" >> "$AUTH_KEYS"
elif [[ -s /root/.ssh/authorized_keys ]]; then
  while IFS= read -r k; do
    [[ -z "$k" || "$k" == \#* ]] && continue
    grep -qxF "$k" "$AUTH_KEYS" || echo "$k" >> "$AUTH_KEYS"
  done < /root/.ssh/authorized_keys
fi
chown "$DEPLOY_USER:$DEPLOY_USER" "$AUTH_KEYS"
chmod 600 "$AUTH_KEYS"

# ---------- 3. Pare-feu UFW (22, 80, 443) ----------
log "Pare-feu UFW"
ufw default deny incoming
ufw default allow outgoing
ufw limit 22/tcp comment 'SSH (anti brute-force)'   # autorisé AVANT d'activer
ufw allow 80/tcp  comment 'HTTP (ACME + redirection)'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable
systemctl enable --now fail2ban

# ---------- 4. Docker Engine (dépôt officiel) ----------
log "Docker Engine"
if ! command -v docker &>/dev/null; then
  for p in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do
    apt-get -y -q remove "$p" &>/dev/null || true
  done
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  cat > /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: ${UBUNTU_CODENAME:-$VERSION_CODENAME}
Components: stable
Signed-By: /etc/apt/keyrings/docker.asc
EOF
  apt-get update -q
  apt-get -y -q install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

# Rotation des logs par défaut + conteneurs maintenus pendant un redémarrage du démon
if [[ ! -f /etc/docker/daemon.json ]]; then
  install -d /etc/docker
  cat > /etc/docker/daemon.json <<'EOF'
{
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "3" },
  "live-restore": true
}
EOF
  systemctl restart docker
fi
systemctl enable --now docker containerd
usermod -aG docker "$DEPLOY_USER"

# ---------- 5. Réseau Docker partagé "web" ----------
log "Réseau Docker \"web\""
docker network inspect web &>/dev/null || docker network create web

# ---------- 6. Dossier applicatif ----------
log "Dossier ${APP_DIR}"
install -d -m 750 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "$APP_DIR"

# ---------- 7. Swap (évite les OOM pendant `next build`) ----------
RAM_MB=$(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo)
if [[ "$SWAP_SIZE" != "0" ]] && ! swapon --show | grep -q . && (( RAM_MB < 4000 )); then
  log "Swap ${SWAP_SIZE} (RAM ${RAM_MB} Mo)"
  fallocate -l "$SWAP_SIZE" /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  sysctl -w vm.swappiness=10 >/dev/null
  echo 'vm.swappiness=10' > /etc/sysctl.d/99-swappiness.conf
fi

# ---------- 8. Durcissement SSH (si une clé est en place) ----------
if [[ "$HARDEN_SSH" == "1" ]]; then
  if ssh-keygen -l -f "$AUTH_KEYS" &>/dev/null; then
    log "Durcissement SSH"
    # Préfixe 00- : sshd retient la PREMIÈRE valeur lue ; doit passer avant
    # 50-cloud-init.conf qui réactive souvent PasswordAuthentication.
    cat > /etc/ssh/sshd_config.d/00-hardening.conf <<'EOF'
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
EOF
    sshd -t || { rm -f /etc/ssh/sshd_config.d/00-hardening.conf; die "Config sshd invalide, annulée."; }
    systemctl reload ssh 2>/dev/null || systemctl reload sshd
  else
    warn "Aucune clé SSH valide pour ${DEPLOY_USER} : durcissement SSH NON appliqué."
    warn "Relance avec DEPLOY_PUBKEY=\"ssh-ed25519 …\" pour l'activer."
  fi
fi

# ---------- Récapitulatif ----------
log "Terminé"
echo "  Docker   : $(docker --version)"
echo "  Compose  : $(docker compose version --short)"
echo "  Réseau   : $(docker network inspect web -f '{{.Name}} ({{.Driver}})')"
echo "  UFW      :"; ufw status | sed 's/^/    /'
echo "  Swap     : $(swapon --show --noheadings | awk '{print $1" "$3}' || echo aucun)"
echo
warn "AVANT de fermer cette session root, teste dans un AUTRE terminal :"
echo "    ssh ${DEPLOY_USER}@<IP> 'docker ps && sudo -n true 2>/dev/null || echo sudo: mot de passe requis'"
warn "Définis un mot de passe sudo pour ${DEPLOY_USER} :  passwd ${DEPLOY_USER}"
warn "Rappel : Docker contourne UFW pour les ports publiés (-p). Ne publie que 80/443 (Traefik)."
