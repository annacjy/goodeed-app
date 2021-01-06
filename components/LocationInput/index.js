import styles from './styles.module.scss';
import Autocomplete from 'react-google-autocomplete';

const LocationInput = ({ onPlaceSelected, defaultValue }) => {
  const setLatLng = place => {
    const {
      geometry: { location },
      formatted_address,
    } = place;
    const lat = location.lat();
    const lng = location.lng();

    onPlaceSelected({ lat, lng, address: formatted_address });
  };

  return (
    <div className={styles.autocompleteInput}>
      <label>Location</label>
      <Autocomplete
        style={{ width: '90%' }}
        types={['address']}
        defaultValue={defaultValue}
        onPlaceSelected={place => setLatLng(place)}
      />
    </div>
  );
};

export default LocationInput;
