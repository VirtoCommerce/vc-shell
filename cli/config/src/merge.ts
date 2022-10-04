const merge = (...instances) => {
  let i = instances.length - 1;
  while (i > 0) {
    instances[i - 1] = mergeConfigs(instances[i - 1], instances[i]);
    i--;
  }
  return instances[0];
};

function mergeConfigs(target, source) {
  const isObject = (obj) => obj && typeof obj === "object";

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      const targetValue = target[key];
      const sourceValue = source[key];

      if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
        target[key] = targetValue.concat(sourceValue);
      } else if (isObject(targetValue) && isObject(sourceValue)) {
        target[key] = merge(Object.assign({}, targetValue), sourceValue);
      } else {
        target[key] = sourceValue;
      }
    });
  }

  return target;
}

export default merge;
