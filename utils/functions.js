export const calcDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  } else {
    const radlat1 = (Math.PI * lat1) / 180;
    const radlat2 = (Math.PI * lat2) / 180;
    const theta = lon1 - lon2;
    const radtheta = (Math.PI * theta) / 180;
    let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;

    dist = dist * 1.609344;

    return dist;
  }
};

export const dateTimeFormatter = value => {
  const date = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(value);
  const timeAmPm = value.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

  return `${date} - ${timeAmPm}`;
};

export const convertBlobToBase64 = fileObject => {
  const blob = new Blob([fileObject], { type: fileObject.type });
  let reader = new FileReader();

  let base64String;
  reader.readAsDataURL(blob);
  reader.onloadend = function() {
    return reader.result;
  };

  return base64String;
};
