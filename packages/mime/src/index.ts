import extensions from './types.json';
let types = {};
for (let n in extensions){
  let a = extensions[n];
  for (let i = 0; i < a.length; i ++)
    types[a[i]] = n;
};
function getType(path: string): string{
  let ext = (path.split('.').pop() || '').toLowerCase();
  return types[ext]
};
function getExtension(type: string): string{
  let extension = extensions[type.toLowerCase()];
  if (extension)
    return extension[0]
  else
    return ''
}
export default {
  getType,
  getExtension
}