#!/bin/bash

# Script de démarrage robuste pour MiaTech
# Usage: ./start-server.sh

echo "🚀 Démarrage de MiaTech..."

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_DIR="/home/marina/MiaTech/server"
PID_FILE="/tmp/miatech-server.pid"
LOG_FILE="/tmp/miatech-server.log"

# Fonction pour afficher les messages colorés
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Fonction pour tuer les anciens processus
kill_old_processes() {
    if [ -f "$PID_FILE" ]; then
        OLD_PID=$(cat "$PID_FILE")
        if kill -0 "$OLD_PID" 2>/dev/null; then
            log "Arrêt de l'ancien serveur (PID: $OLD_PID)..."
            kill "$OLD_PID"
            sleep 2
            if kill -0 "$OLD_PID" 2>/dev/null; then
                warning "Arrêt forcé du serveur..."
                kill -9 "$OLD_PID"
            fi
        fi
        rm -f "$PID_FILE"
    fi
    
    # Tuer tous les processus Node.js server-temp
    pkill -f "node.*server-temp.js" 2>/dev/null || true
}

# Fonction pour vérifier les dépendances
check_dependencies() {
    log "Vérification des dépendances..."
    
    if ! command -v node &> /dev/null; then
        error "Node.js n'est pas installé"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        error "npm n'est pas installé"
        exit 1
    fi
    
    if [ ! -f "$SERVER_DIR/server-temp.js" ]; then
        error "Fichier serveur non trouvé: $SERVER_DIR/server-temp.js"
        exit 1
    fi
    
    success "Toutes les dépendances sont OK"
}

# Fonction pour installer les packages npm si nécessaire
install_packages() {
    cd "$SERVER_DIR"
    
    if [ ! -d "node_modules" ]; then
        log "Installation des packages npm..."
        npm install --silent
        success "Packages npm installés"
    fi
}

# Fonction pour démarrer le serveur
start_server() {
    cd "$SERVER_DIR"
    
    log "Démarrage du serveur MiaTech..."
    
    # Démarrer le serveur en arrière-plan
    nohup node server-temp.js > "$LOG_FILE" 2>&1 &
    SERVER_PID=$!
    
    # Sauvegarder le PID
    echo $SERVER_PID > "$PID_FILE"
    
    # Attendre que le serveur démarre
    sleep 3
    
    # Vérifier si le serveur fonctionne
    if kill -0 "$SERVER_PID" 2>/dev/null; then
        success "Serveur démarré avec succès (PID: $SERVER_PID)"
        success "URL: http://localhost:5000"
        success "Admin: http://localhost:5000/admin-login"
        
        # Tester la connectivité
        if curl -s http://localhost:5000/api/test &> /dev/null; then
            success "API fonctionne correctement"
        else
            warning "L'API ne répond pas encore, patience..."
        fi
    else
        error "Échec du démarrage du serveur"
        exit 1
    fi
}

# Fonction pour monitorer le serveur
monitor_server() {
    if [ "$1" = "--monitor" ]; then
        log "Mode monitoring activé..."
        
        while true; do
            if [ -f "$PID_FILE" ]; then
                SERVER_PID=$(cat "$PID_FILE")
                if ! kill -0 "$SERVER_PID" 2>/dev/null; then
                    error "Le serveur s'est arrêté! Redémarrage..."
                    start_server
                fi
            else
                error "Fichier PID non trouvé! Redémarrage..."
                start_server
            fi
            
            sleep 10
        done
    fi
}

# Fonction pour afficher les logs
show_logs() {
    if [ "$1" = "--logs" ]; then
        log "Affichage des logs en temps réel..."
        tail -f "$LOG_FILE"
    fi
}

# Fonction pour arrêter le serveur
stop_server() {
    if [ "$1" = "--stop" ]; then
        log "Arrêt du serveur..."
        kill_old_processes
        success "Serveur arrêté"
        exit 0
    fi
}

# Fonction pour afficher le statut
show_status() {
    if [ "$1" = "--status" ]; then
        log "Vérification du statut..."
        
        if [ -f "$PID_FILE" ]; then
            SERVER_PID=$(cat "$PID_FILE")
            if kill -0 "$SERVER_PID" 2>/dev/null; then
                success "Serveur en cours d'exécution (PID: $SERVER_PID)"
                
                # Test de connectivité
                if curl -s http://localhost:5000/api/test &> /dev/null; then
                    success "API accessible: http://localhost:5000"
                else
                    warning "API non accessible"
                fi
            else
                error "Serveur non actif (PID dans le fichier mais processus mort)"
            fi
        else
            error "Serveur non démarré (pas de fichier PID)"
        fi
        exit 0
    fi
}

# Fonction d'aide
show_help() {
    if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
        echo "🚀 MiaTech Server Manager"
        echo ""
        echo "Usage: $0 [OPTION]"
        echo ""
        echo "Options:"
        echo "  (aucune)     Démarrer le serveur"
        echo "  --monitor    Démarrer avec monitoring automatique"
        echo "  --logs       Afficher les logs en temps réel"
        echo "  --status     Afficher le statut du serveur"
        echo "  --stop       Arrêter le serveur"
        echo "  --help, -h   Afficher cette aide"
        echo ""
        echo "Exemples:"
        echo "  $0                    # Démarrer le serveur"
        echo "  $0 --monitor          # Démarrer avec auto-restart"
        echo "  $0 --logs             # Voir les logs"
        echo "  $0 --status           # Vérifier le statut"
        echo "  $0 --stop             # Arrêter le serveur"
        exit 0
    fi
}

# Menu principal
main() {
    echo "🚀====================================🚀"
    echo "   MiaTech Server Manager"
    echo "   Version: 1.0"
    echo "   Auteur: Assistant IA"
    echo "🚀====================================🚀"
    echo ""
    
    # Traitement des arguments
    show_help "$1"
    stop_server "$1"
    show_status "$1"
    show_logs "$1"
    
    # Démarrage normal
    check_dependencies
    kill_old_processes
    install_packages
    start_server
    monitor_server "$1"
    
    log "Serveur MiaTech prêt! 🎉"
    log "Appuyez sur Ctrl+C pour arrêter"
    
    # Attendre un signal d'arrêt
    trap 'log "Signal reçu, arrêt..."; kill_old_processes; exit 0' INT TERM
    
    # Garder le script en vie
    while true; do
        sleep 1
    done
}

# Exécuter le script principal
main "$@"