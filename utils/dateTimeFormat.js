export default function DateTimeFormat(value) {
  const date = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(value);
  const timeAmPm = value.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

  return `${date} - ${timeAmPm}`;
}
