export function parseEmailFrom(fromField: string): {
  name: string;
  email: string;
} {
  const result = {
    name: '',
    email: '',
  };

  if (!fromField) return result;

  const regex = /^(?:"?([^"]*)"?\s)?<?([^<>]+)>?$/;
  const matches = fromField.match(regex);

  if (matches) {
    result.name = matches[1] ? matches[1].trim() : matches[2].trim().split('@')[0];
    result.email = matches[2].trim();
  }

  return result;
}
