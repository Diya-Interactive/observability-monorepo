/**
 * @your-org/observability-cli - Docker Compose configuration generator
 */

import { InstallConfig } from '../utils/prompts';

/**
 * Generate docker-compose.yml for the full observability stack
 */
export function generateDockerCompose(config: InstallConfig): string {
  return `version: '3.8'

services:
  # Log aggregation
  loki:
    image: grafana/loki:2.9.3
    container_name: loki
    ports:
      - "3100:3100"
    volumes:
      - ./loki-config.yml:/etc/loki/local-config.yaml
      - loki-storage:/loki
    command: -config.file=/etc/loki/local-config.yaml
    networks:
      - observability
    restart: unless-stopped

  # Log shipper
  promtail:
    image: grafana/promtail:2.9.3
    container_name: promtail
    ports:
      - "9080:9080"
      - "514:514/udp"
    volumes:
      - ./promtail-config.yml:/etc/promtail/config.yaml
      - /var/log:/var/log:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
    command: -config.file=/etc/promtail/config.yaml
    networks:
      - observability
    restart: unless-stopped

  # Metrics collection
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - ./app-alerts.yml:/etc/prometheus/app-alerts.yml
      - ./infra-alerts.yml:/etc/prometheus/infra-alerts.yml
      - ./security-alerts.yml:/etc/prometheus/security-alerts.yml
      - prometheus-storage:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/usr/share/prometheus/console_libraries'
      - '--web.console.templates=/usr/share/prometheus/consoles'
    networks:
      - observability
    restart: unless-stopped

  # Host metrics
  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    networks:
      - observability
    restart: unless-stopped

  # Alert routing
  alertmanager:
    image: prom/alertmanager:latest
    container_name: alertmanager
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml
      - alertmanager-storage:/alertmanager
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
    networks:
      - observability
    restart: unless-stopped

  # Traces collection
  otel-collector:
    image: otel/opentelemetry-collector-contrib:latest
    container_name: otel-collector
    ports:
      - "4317:4317"   # OTLP gRPC
      - "4318:4318"   # OTLP HTTP
      - "8888:8888"   # Prometheus metrics
    volumes:
      - ./otel-config.yml:/etc/otel/config.yaml
    command: ["--config=/etc/otel/config.yaml"]
    networks:
      - observability
    restart: unless-stopped

  # Dashboards and alerting UI
  grafana:
    image: grafana/grafana:10.0.0
    container_name: grafana
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: '${config.grafanaPassword}'
      GF_INSTALL_PLUGINS: 'grafana-piechart-panel,grafana-clock-panel'
      GF_USERS_ALLOW_SIGN_UP: 'false'
    volumes:
      - ./grafana-datasources.yml:/etc/grafana/provisioning/datasources/datasources.yaml
      - ./grafana-dashboard-provider.yml:/etc/grafana/provisioning/dashboards/provider.yaml
      - ./grafana-app-dashboard.json:/etc/grafana/provisioning/dashboards/app-dashboard.json
      - ./grafana-infra-dashboard.json:/etc/grafana/provisioning/dashboards/infra-dashboard.json
      - ./grafana-security-dashboard.json:/etc/grafana/provisioning/dashboards/security-dashboard.json
      - grafana-storage:/var/lib/grafana
    networks:
      - observability
    restart: unless-stopped
    depends_on:
      - prometheus
      - loki

volumes:
  loki-storage:
  prometheus-storage:
  alertmanager-storage:
  grafana-storage:

networks:
  observability:
    driver: bridge
`;
}
