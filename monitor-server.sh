#!/bin/bash

# Script de surveillance et relance automatique du serveur MiaTech
# Évite les erreurs de connexion en surveillant le serveur

SERVER_PORT=5000
SERVER_DIR="/home/marina/MiaTech"
SERVER_SCRIPT="server/server-temp.js"
PID_FILE="/tmp/miatech-server.pid"
LOG_FILE="$SERVER_DIR/server.log"

check_server() {
    # Vérifier si le serveur répond
    curl -s -f http://localhost:$SERVER_PORT/api/users > /dev/null 2>&1
    return $?
}

start_server() {
    echo "$(date) - 🚀 Démarrage du serveur MiaTech..."
    cd "$SERVER_DIR"
    nohup node "$SERVER_SCRIPT" > "$LOG_FILE" 2>&1 &
    SERVER_PID=$!
    echo $SERVER_PID > "$PID_FILE"
    echo "$(date) - ✅ Serveur démarré avec PID: $SERVER_PID"
    sleep 3
}

stop_server() {
    if [ -f "$PID_FILE" ]; then
        SERVER_PID=$(cat "$PID_FILE")
        echo "$(date) - 🛑 Arrêt du serveur PID: $SERVER_PID"
        kill $SERVER_PID 2>/dev/null
        rm -f "$PID_FILE"
    fi
    pkill -f "server-temp.js" 2>/dev/null
    echo "$(date) - ✅ Serveur arrêté"
}

restart_server() {
    echo "$(date) - 🔄 Redémarrage du serveur..."
    stop_server
    sleep 2
    start_server
}

monitor_server() {
    while true; do
        if ! check_server; then
            echo "$(date) - ❌ Serveur non accessible, redémarrage..."
            restart_server
        else
            echo "$(date) - ✅ Serveur OK"
        fi
        sleep 30  # Vérifier toutes les 30 secondes
    done
}

case "$1" in
    start)
        start_server
        ;;
    stop)
        stop_server
        ;;
    restart)
        restart_server
        ;;
    monitor)
        echo "$(date) - 🔍 Démarrage de la surveillance du serveur..."
        monitor_server
        ;;
    status)
        if check_server; then
            echo "✅ Serveur MiaTech est en ligne"
        else
            echo "❌ Serveur MiaTech hors ligne"
        fi
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|monitor|status}"
        exit 1
        ;;
esac