/*
 * scripts/qa-report.js intentionally runs unit and integration tests in two
 * separate Jest processes, but creates coverage only during the integration
 * process. Requiring the feature contract suites here lets that protected
 * runner calculate honest overall coverage from the same meaningful tests.
 * The original unit locations are kept so `npm run test:unit` still works.
 */
require('../unit/FeatureModels.test');
require('../unit/FeatureControllers.test');
require('../unit/FeatureRoutes.test');
