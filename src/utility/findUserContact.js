import fetchByPage from './fetchByPage';

export default async function findUserContact(user) {
  if (!user?.clients?.length) {
    return null;
  }

  const rows = await fetchByPage(`/api/contacts/?client_id=${user.clients[0].id}`);
  return (
    rows.find((row) => row.user_id === user.id) ||
    rows.find((row) => row.email?.toLowerCase() === user.email?.toLowerCase()) ||
    null
  );
}
