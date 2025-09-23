import type {
  IExecuteFunctions,
  IHttpRequestOptions,
  INodeExecutionData,
  INodeProperties,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

const OPERATION_OPTIONS: INodeProperties = {
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  default: 'trueRandomInteger',
  description: 'Select the action to perform',
  noDataExpression: true,
  options: [
    {
      name: 'True Random Number Generator',
      value: 'trueRandomInteger',
      action: 'Generate a true random integer',
    },
  ],
};

export class Random implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Random',
    name: 'random',
    icon: 'file:random.svg',
    group: ['transform'],
    version: 1,
    description: 'Generate true random integers via Random.org',
    defaults: {
      name: 'Random',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [],
    properties: [
      OPERATION_OPTIONS,
      {
        displayName: 'Min',
        name: 'min',
        type: 'number',
        typeOptions: {
          numberPrecision: 0,
        },
        required: true,
        default: 1,
        description: 'Minimum integer to generate (inclusive)',
        displayOptions: {
          show: {
            operation: ['trueRandomInteger'],
          },
        },
      },
      {
        displayName: 'Max',
        name: 'max',
        type: 'number',
        typeOptions: {
          numberPrecision: 0,
        },
        required: true,
        default: 60,
        description: 'Maximum integer to generate (inclusive)',
        displayOptions: {
          show: {
            operation: ['trueRandomInteger'],
          },
        },
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
      const operation = this.getNodeParameter('operation', itemIndex);

      if (operation !== 'trueRandomInteger') {
        throw new NodeOperationError(this.getNode(), `Unsupported operation: ${operation as string}`);
      }

      const min = this.getNodeParameter('min', itemIndex) as number;
      const max = this.getNodeParameter('max', itemIndex) as number;

      if (!Number.isInteger(min) || !Number.isInteger(max)) {
        throw new NodeOperationError(this.getNode(), 'Min and Max must be integers.');
      }

      if (min > max) {
        throw new NodeOperationError(this.getNode(), 'Min cannot be greater than Max.');
      }

      const requestOptions: IHttpRequestOptions = {
        method: 'GET',
        url: 'https://www.random.org/integers/',
        qs: {
          num: 1,
          min,
          max,
          col: 1,
          base: 10,
          format: 'plain',
          rnd: 'new',
        },
        headers: {
          'User-Agent': 'n8n-nodes-random/0.1.0 (+https://www.random.org)',
        },
        json: false,
        returnFullResponse: false,
        timeout: 15000,
      };

      let response: string;

      try {
        const rawResponse = await this.helpers.httpRequest(requestOptions);
        response = typeof rawResponse === 'string' ? rawResponse : String(rawResponse);
      } catch (error) {
        throw new NodeOperationError(
          this.getNode(),
          'Failed to fetch random number from Random.org.',
          {
            description: 'Ensure Random.org is reachable and request limits have not been exceeded.',
          },
        );
      }

      const result = Number.parseInt(response.trim(), 10);

      if (!Number.isInteger(result)) {
        throw new NodeOperationError(this.getNode(), 'Received unexpected response from Random.org.');
      }

      returnData.push({
        json: {
          min,
          max,
          result,
          provider: 'random.org',
        },
      });
    }

    return [returnData];
  }
}
