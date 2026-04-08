/**
 * @your-org/observability-cli - Grafana configuration generator
 */

/**
 * Generate Grafana datasources provisioning file
 */
export function generateGrafanaDatasources(): string {
  return `apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true

  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100
    editable: true
`;
}

/**
 * Generate Grafana dashboard provider configuration
 */
export function generateGrafanaDashboardProvider(): string {
  return `apiVersion: 1

providers:
  - name: 'Observability Dashboards'
    orgId: 1
    folder: 'Observability'
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /etc/grafana/provisioning/dashboards
`;
}

/**
 * Generate application overview dashboard JSON
 */
export function generateAppDashboard(): string {
  return JSON.stringify({
    dashboard: {
      title: 'Application Overview',
      tags: ['application', 'overview'],
      timezone: 'browser',
      panels: [
        {
          id: 1,
          title: 'Error Rate (5m)',
          type: 'timeseries',
          targets: [
            {
              expr: 'sum(rate({level="error"} [5m])) by (service)',
              legendFormat: '{{ service }}',
            },
          ],
        },
        {
          id: 2,
          title: 'P95 Latency',
          type: 'timeseries',
          targets: [
            {
              expr: 'histogram_quantile(0.95, sum(rate({duration_ms!=""}[5m])) by (le))',
              legendFormat: 'p95',
            },
          ],
        },
        {
          id: 3,
          title: 'Request Volume',
          type: 'timeseries',
          targets: [
            {
              expr: 'sum(rate({msg!=""}[5m])) by (service)',
              legendFormat: '{{ service }}',
            },
          ],
        },
        {
          id: 4,
          title: 'Recent Errors',
          type: 'logs',
          targets: [
            {
              expr: '{level="error"}',
              refId: 'A',
            },
          ],
        },
      ],
    },
  }, null, 2);
}

/**
 * Generate infrastructure overview dashboard JSON
 */
export function generateInfraDashboard(): string {
  return JSON.stringify({
    dashboard: {
      title: 'Infrastructure Overview',
      tags: ['infrastructure', 'overview'],
      timezone: 'browser',
      panels: [
        {
          id: 1,
          title: 'CPU Usage per Host',
          type: 'timeseries',
          targets: [
            {
              expr: 'node_cpu_seconds_total',
              legendFormat: '{{ instance }}',
            },
          ],
        },
        {
          id: 2,
          title: 'Memory Usage per Host',
          type: 'timeseries',
          targets: [
            {
              expr: '1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)',
              legendFormat: '{{ instance }}',
            },
          ],
        },
        {
          id: 3,
          title: 'Disk Usage',
          type: 'gauge',
          targets: [
            {
              expr: '1 - (node_filesystem_avail_bytes / node_filesystem_size_bytes)',
              legendFormat: '{{ mountpoint }}',
            },
          ],
        },
        {
          id: 4,
          title: 'Host Status',
          type: 'table',
          targets: [
            {
              expr: 'up{job="node-exporter"}',
              format: 'table',
            },
          ],
        },
      ],
    },
  }, null, 2);
}

/**
 * Generate security overview dashboard JSON
 */
export function generateSecurityDashboard(): string {
  return JSON.stringify({
    dashboard: {
      title: 'Security Overview',
      tags: ['security', 'overview'],
      timezone: 'browser',
      panels: [
        {
          id: 1,
          title: 'Auth Failure Rate (5m)',
          type: 'timeseries',
          targets: [
            {
              expr: 'sum(rate({level="error", msg=~".*auth.*"}[5m]))',
              legendFormat: 'failures/sec',
            },
          ],
        },
        {
          id: 2,
          title: 'Top Failed IPs',
          type: 'table',
          targets: [
            {
              expr: 'topk(10, sum by (remote_addr) (rate({status_code="401"}[5m])))',
            },
          ],
        },
        {
          id: 3,
          title: 'Recent Security Logs',
          type: 'logs',
          targets: [
            {
              expr: '{job="security"}',
              refId: 'A',
            },
          ],
        },
      ],
    },
  }, null, 2);
}
