import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import ContactForm from '../components/ContactForm'
import Card from '../components/Card'
import SettingsMenu from '../components/SettingsMenu'
import fetchByPage from '../utility/fetchByPage'

export default function MyProfile() {
  const user = useSelector((state) => state.userInfo.user)
  const [contact, setContact] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadContact = useCallback(async () => {
    if (!user?.clients?.length) {
      setContact(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')
      const rows = await fetchByPage(`/api/contacts/?client_id=${user.clients[0].id}`)
      const match =
        rows.find((row) => row.user_id === user.id) ||
        rows.find((row) => row.email?.toLowerCase() === user.email?.toLowerCase())
      setContact(match || null)
    } catch (err) {
      console.error('Error loading profile contact', err)
      setError('Unable to load your contact information. Please refresh and try again.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadContact()
  }, [loadContact])

  const initialValues = useMemo(() => ({
    name: `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim(),
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    client_id: user?.clients?.[0]?.id,
    account_name: user?.clients?.[0]?.account_name,
  }), [user])

  return (
    <div className="mt-16 p-6 w-full text-sm flex flex-col items-center font-sans">
      <h1 className="text-2xl font-bold text-green-800 m-8 self-start">Settings &gt; My Profile</h1>
      <Card
        className={'w-full'}
        header={
          <div className="flex justify-start rounded space-x-6 mb-8 self-start bg-[white] w-full p-2">
            <SettingsMenu activeTab={'contacts'} />
          </div>
        }
      >
        <div className="mt-2 p-6 w-full md:w-full mx-auto border shadow-md rounded-lg bg-white">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Manage your profile</h2>
            <p className="text-sm text-gray-600">
              Update your personal information and notification preferences from a single place.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-10 text-center text-gray-600">Loading your profile...</div>
          ) : (
            <ContactForm
              contact={contact}
              embedded
              initialValues={initialValues}
              onSaved={loadContact}
            />
          )}
        </div>
      </Card>
    </div>
  )
}
