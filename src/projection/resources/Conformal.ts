
const getConformal = Buffer.from(conformal, 'base64').toString();
const getConformalJSON = JSON.parse(getConformal);

export {getConformal, getConformalJSON};