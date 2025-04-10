import dayjs from 'dayjs';

export default function withElasticParams<T>(params: URLSearchParams) {
  let processedParams = {};
  for (const key of params.keys() as any) {
    const rawValue = params.get(key);
    if (rawValue.trim() === '') continue;
    console.log(rawValue);
    if (!dayjs(rawValue).isValid() && rawValue.includes(':')) {
      const [operator, value] = rawValue.split(':');
      switch (operator.toLowerCase()) {
        case 'gt':
        case 'gte':
        case 'lt':
        case 'lte':
          processedParams[key] = {
            [`$${operator.toLowerCase()}`]: value,
          };
          break;
        case 'in':
          processedParams[key] = {
            $in: value.split(','),
          };
          break;
        default:
          processedParams[key] = value;
      }
    } else {
      processedParams[key] = rawValue;
    }
  }
  return processedParams as T;
}
