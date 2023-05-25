export const decodeParam = (s?: string) => {
  return s.replace(/#/g, '').replace(/\//g, '');
}

export const getDisplayTitle = (s?: string) => {
  if (!s) return;
  return s.replace(/_/g, " ").toLowerCase();
}

export const createLinkText = (s: string) => {
  const splits = s.split('- ');
  const title = splits[splits.length - 1];
  return title.toLowerCase().replace(/ /g, "_");
}

export const titleOrPlaceholder = (s: string, about: boolean) => {
  if (s) return getDisplayTitle(s);
  return about ? '' : 'select a sketch';
}
