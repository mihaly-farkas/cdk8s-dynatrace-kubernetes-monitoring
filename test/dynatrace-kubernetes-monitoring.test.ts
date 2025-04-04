import { describe } from '@jest/globals';
import { Chart, Testing } from 'cdk8s';
import { DeploymentOption, DynatraceKubernetesMonitoring, DynatraceKubernetesMonitoringProps } from '../src';
import * as yaml from 'js-yaml';
import { toMatchFile } from 'jest-file-snapshot';

expect.extend({toMatchFile});


const snapshotsDir = `${__dirname}/__snapshots__`;

const testDynatraceKubernetesMonitoring = (props: { constructProps: DynatraceKubernetesMonitoringProps, snapshotFileComment?: string }): string => {
  // Arrange
  const app = Testing.app();
  const chart = new Chart(app, 'test');

  // Act
  new DynatraceKubernetesMonitoring(chart, 'dynatrace-kubernetes-monitoring', props.constructProps);

  const yamlCommentLines = props?.snapshotFileComment
                                ?.trim()
                                ?.split(/\r?\n/)
                                ?.map((commentLine) => commentLine.trim())
                                ?.filter((commentLine) => commentLine.length > 0)
                                ?.map(line => `# ${line}\n`)
                                ?.join('') || '';

  const yamlContent = Testing.synth(chart)
                             .map((section: any) => yaml.dump(section))
                             .join('---\n');


  return `${yamlCommentLines}${yamlContent}`;
};

// Default values for the test cases
const defaultDeploymentOption = DeploymentOption.PLATFORM;
const defaultApiUrl = 'https://ENVIRONMENTID.live.dynatrace.com/api';
const defaultApiToken = '*** API TOKEN 1 ***';

describe('The Dynatrace Kubernetes monitoring construct,', () => {

  describe('when configured with platform monitoring', () => {

    describe('and only the required parameters,', () => {

      it('must produce a manifest identical to the one published on the Dynatrace website.', () => {
        const manifest = testDynatraceKubernetesMonitoring({
          constructProps: {
            deploymentOption: DeploymentOption.PLATFORM,
            apiUrl: defaultApiUrl,
            tokens: {
              apiToken: defaultApiToken,
            },
          },
          snapshotFileComment:
            'The expected output is the same as the one published on the Dynatrace website:\n' +
            'https://docs.dynatrace.com/docs/ingest-from/setup-on-k8s/deployment/platform-observability#helm',
        });

        // Assert
        expect(manifest).toMatchFile(`${snapshotsDir}/default.platform-monitoring.yaml`);
      });
    });
  });

  describe('when configured with platform monitoring + application observability', () => {

    describe('and only the required parameters,', () => {

      it('must produce a manifest identical to the one published on the Dynatrace website.', () => {
        const manifest = testDynatraceKubernetesMonitoring({
          constructProps: {
            deploymentOption: DeploymentOption.APPLICATION,
            apiUrl: defaultApiUrl,
            tokens: {
              apiToken: defaultApiToken,
            },
          },
          snapshotFileComment:
            'The expected output is the same as the one published on the Dynatrace website:\n' +
            'https://docs.dynatrace.com/docs/ingest-from/setup-on-k8s/deployment/application-observability#helm',
        });

        // Assert
        expect(manifest).toMatchFile(`${snapshotsDir}/default.application-monitoring.yaml`);
      });
    });
  });

  describe('when configured with platform monitoring + full-stack observability', () => {

    describe('and only the required parameters,', () => {

      it('must produce a manifest identical to the one published on the Dynatrace website.', () => {
        const manifest = testDynatraceKubernetesMonitoring({
          constructProps: {
            deploymentOption: DeploymentOption.FULL_STACK,
            apiUrl: defaultApiUrl,
            tokens: {
              apiToken: defaultApiToken,
            },
          },
          snapshotFileComment:
            'The expected output is the same as the one published on the Dynatrace website:\n' +
            'https://docs.dynatrace.com/docs/ingest-from/setup-on-k8s/deployment/application-observability#helm',
        });

        // Assert
        expect(manifest).toMatchFile(`${snapshotsDir}/default.full-stack-monitoring.yaml`);
      });
    });
  });

  describe.each([
    ['example-1', defaultApiUrl],
    ['example-2', 'https://fd567567.live.dynatrace.com/api'],
  ])('when configured with an API URL (%s)', (dataSetName, apiUrl) => {

    it('must produce a manifest with the given value.', () => {
      const manifest = testDynatraceKubernetesMonitoring({
        constructProps: {
          deploymentOption: defaultDeploymentOption,
          apiUrl: apiUrl,
          tokens: {
            apiToken: defaultApiToken,
          },
        },
        snapshotFileComment: 'The value of the API URL must match the specified one.',
      });

      // Assert
      expect(manifest).toMatchFile(`${snapshotsDir}/api-url.${dataSetName}.yaml`);
    });
  });

  describe.each([
    ['example-1', defaultApiToken],
    ['example-2', '*** API TOKEN 2 ***'],
  ])('when configured with an API token (%s)', (dataSetName, apiToken) => {

    it('must produce a manifest with the given value.', () => {
      const manifest = testDynatraceKubernetesMonitoring({
        constructProps: {
          deploymentOption: defaultDeploymentOption,
          apiUrl: defaultApiUrl,
          tokens: {
            apiToken: apiToken,
          },
        },
        snapshotFileComment: 'The value of the API token must match the specified one.',
      });

      // Assert
      expect(manifest).toMatchFile(`${snapshotsDir}/api-token.${dataSetName}.yaml`);
    });
  });

  describe.each([
    ['example-1', DeploymentOption.PLATFORM, '*** DATA INGEST TOKEN 1 ***'],
    ['example-2', DeploymentOption.PLATFORM, '*** DATA INGEST TOKEN 2 ***'],
  ])('when configured with a data ingest token (%s)', (dataSetName, deploymentOption, dataIngestToken) => {

    it('must produce a manifest with the given value.', () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {
      });

      const manifest = testDynatraceKubernetesMonitoring({
        constructProps: {
          deploymentOption: deploymentOption,
          apiUrl: defaultApiUrl,
          tokens: {
            apiToken: defaultApiToken,
            dataIngestToken,
          },
        },
        snapshotFileComment:
          'In the case of a platform deployment, the data ingest token is not applicable and therefore should not be set.\n' +
          'So, the expected manifest is practically the same as the one with the default properties only.',
      });

      // Assert
      expect(manifest).toMatchFile(`${snapshotsDir}/data-ingest-token.${dataSetName}.${deploymentOption}.yaml`);
      expect(warn).toBeCalledWith('WARNING: Data ingest token is not supported for platform monitoring. It will be ignored.');
    });
  });

  describe.each([
    ['example-3', DeploymentOption.APPLICATION, '*** DATA INGEST TOKEN  1 ***'],
    ['example-4', DeploymentOption.APPLICATION, '*** DATA INGEST TOKEN  2 ***'],
    ['example-5', DeploymentOption.FULL_STACK, '*** DATA INGEST TOKEN  1 ***'],
    ['example-6', DeploymentOption.FULL_STACK, '*** DATA INGEST TOKEN  2 ***'],
  ])('when configured with a data ingest token (%s)', (dataSetName, deploymentOption, dataIngestToken) => {

    it('must produce a manifest with the given value.', () => {
      const manifest = testDynatraceKubernetesMonitoring({
        constructProps: {
          deploymentOption: deploymentOption,
          apiUrl: defaultApiUrl,
          tokens: {
            apiToken: defaultApiToken,
            dataIngestToken,
          },
        },
        snapshotFileComment: 'The value of the data ingest token must match the specified one.',
      });

      // Assert
      expect(manifest).toMatchFile(`${snapshotsDir}/data-ingest-token.${dataSetName}.${deploymentOption}.yaml`);
    });
  });

  describe.each([
    ['example-1', 'custom-namespace-1'],
    ['example-2', 'custom-namespace-2'],
  ])('when configured with custom namespace name (%s)', (dataSetName, namespaceName) => {

    it('must produce a manifest with the given value.', () => {
      const manifest = testDynatraceKubernetesMonitoring({
        constructProps: {
          deploymentOption: defaultDeploymentOption,
          apiUrl: defaultApiUrl,
          tokens: {
            apiToken: defaultApiToken,
          },
          namespaceName,
        },
        snapshotFileComment: 'The value of the namespace names must match the specified one.',
      });

      // Assert
      expect(manifest).toMatchFile(`${snapshotsDir}/custom-namespace.${dataSetName}.yaml`);
    });
  });

  describe.each([
    ['example-1', {annotations: {'custom-annotation-1': 'annotation-value-1'}, labels: {'custom-label-1': 'label-value-1'}}],
    ['example-2', {annotations: {'custom-annotation-2': 'annotation-value-2'}, labels: {'custom-label-2': 'label-value-2'}}],
  ])('when configured with custom namespace props (%s)', (dataSetName, namespaceProps) => {

    it('must produce a manifest with the given value.', () => {
      const manifest = testDynatraceKubernetesMonitoring({
        constructProps: {
          deploymentOption: defaultDeploymentOption,
          apiUrl: defaultApiUrl,
          tokens: {
            apiToken: defaultApiToken,
          },
          namespaceProps,
        },
        snapshotFileComment: 'The values in the namespace metadata must match the specified one.',
      });

      // Assert
      expect(manifest).toMatchFile(`${snapshotsDir}/custom-namespace-props.${dataSetName}.yaml`);
    });
  });

  describe('when configured with skip namespace creation', () => {

    it('must produce a manifest with the given value.', () => {
      const manifest = testDynatraceKubernetesMonitoring({
        constructProps: {
          deploymentOption: defaultDeploymentOption,
          apiUrl: defaultApiUrl,
          tokens: {
            apiToken: defaultApiToken,
          },
          skipNamespaceCreation: true,
        },
        snapshotFileComment: 'Since namespace creation is disabled, the manifest must not include the namespace.',
      });

      // Assert
      expect(manifest).toMatchFile(`${snapshotsDir}/skip-namespace-creation.default.yaml`);
    });

    describe('and with custom namespace name', () => {
      it('must produce a manifest with the given value.', () => {
        const manifest = testDynatraceKubernetesMonitoring({
          constructProps: {
            deploymentOption: defaultDeploymentOption,
            apiUrl: defaultApiUrl,
            tokens: {
              apiToken: defaultApiToken,
            },
            namespaceName: 'custom-namespace',
            skipNamespaceCreation: true,
          },
        });

        // Assert
        expect(manifest).toMatchFile(`${snapshotsDir}/skip-namespace-creation.custom-namespace.yaml`);
      });
    });

    describe('and with custom namespace props', () => {
      it('must produce a manifest with the given value.', () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {
        });

        const manifest = testDynatraceKubernetesMonitoring({
          constructProps: {
            deploymentOption: defaultDeploymentOption,
            apiUrl: defaultApiUrl,
            tokens: {
              apiToken: defaultApiToken,
            },
            skipNamespaceCreation: true,
            namespaceProps: {
              annotations: {
                'custom-annotation': 'value',
              },
              labels: {
                'custom-label': 'value',
              },
            },
          },
          snapshotFileComment:
            'Since the namespace creation is skipped, the custom namespace properties cannot be not be applied.\n' +
            'So, the expected manifest is practically the same as the one with the default properties only.',
        });

        // Assert
        expect(manifest).toMatchFile(`${snapshotsDir}/skip-namespace-creation.custom-namespace-props.yaml`);
        expect(warn).toBeCalledWith('WARNING: Namespace creation is skipped. Custom namespace properties will not be applied.');
      });
    });
  });
});
