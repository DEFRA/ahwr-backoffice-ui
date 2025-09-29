import {
  createMetricsLogger,
  Unit,
  StorageResolution
} from 'aws-embedded-metrics'

import { config } from '../../../config/config.js'
import { createLogger } from './logging/logger.js'

/**
 * Aws embedded metrics wrapper
 */
export async function recordExceptionMetrics(metricName, err) {
  const isMetricsEnabled = config.get('isMetricsEnabled')

  if (!isMetricsEnabled) {
    return
  }

  try {
    const metricsLogger = createMetricsLogger()
    metricsLogger.setProperty('exception', err)
    metricsLogger.putMetric(
      metricName,
      1,
      Unit.Count,
      StorageResolution.Standard
    )
    await metricsLogger.flush()
  } catch (error) {
    createLogger().error(error, error.message)
  }
}
