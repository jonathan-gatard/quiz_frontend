export function formatDate(date) {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export function isInCurrentMonth(date) {
  const currentDate = new Date();
  const checkedDate = new Date(date);
  return (
    checkedDate.getMonth() === currentDate.getMonth() &&
    checkedDate.getFullYear() === currentDate.getFullYear()
  );
}

export  function generatePeriods(number_of_months) {
  const currentDate = new Date();
  const periods = [];
  for (let i = number_of_months - 1; i >= 0; i--) {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const year = newDate.getFullYear();
    const month = newDate.getMonth() + 1;
    periods.push(`${year}/${String(month).padStart(2, '0')}`);
  }
  return periods;
}

export function currentDateYYYYMM() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // les mois commencent à 0, donc on ajoute 1 et on pad à 2 chiffres
  return `${year}/${month}`;
}

export  function formatDateToMMYYYY(dateString) {
  const [year, month] = dateString.split('/');
  return `${month}/${year}`;
}

export  function formatYYYYMMToDate(dateString) {
  if (dateString) {
    const [year, month] = dateString.split('/');
    return new Date(year, month - 1);
  }
  else {
    return null;
  }
}


export function styleModal() {
  return {
    content: {
      width: '80%',
      height: '80%',
      margin: 'auto',
      overflow: 'auto',
    },
    overlay: {
      zIndex: 10,
    }
  };
}