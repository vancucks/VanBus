export const relativeTime = (dateIso: string) => {
  const diffMs = Date.now() - new Date(dateIso).getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60000));

  if (minutes < 60) {
    return `Ha ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `Ha ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  }

  const days = Math.floor(hours / 24);
  return `Ha ${days} ${days === 1 ? 'dia' : 'dias'}`;
};

export const formatDate = (dateIso: string) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateIso));

export const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60000).toISOString();
