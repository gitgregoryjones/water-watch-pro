import React, { useState } from 'react';

const AnonymousReportForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    billingEmail: '',
    phone: '',
    fromDate: '',
    toDate: '',
    locations: [
      { latitude: '', longitude: '', locationName: '', reportTypes: [] },
    ],
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e, i = null, field = null) => {
    if (i !== null && field) {
      const updatedLocations = [...formData.locations];
      updatedLocations[i][field] = e.target.value;
      setFormData({ ...formData, locations: updatedLocations });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleCheckboxChange = (i, value) => {
    const updatedLocations = [...formData.locations];
    const current = updatedLocations[i].reportTypes;
    updatedLocations[i].reportTypes = current.includes(value)
      ? current.filter((r) => r !== value)
      : [...current, value];
    setFormData({ ...formData, locations: updatedLocations });
  };

  const addLocation = () => {
    setFormData({
      ...formData,
      locations: [
        ...formData.locations,
        { latitude: '', longitude: '', locationName: '', reportTypes: [] },
      ],
    });
  };

  const removeLocation = (index) => {
    const updated = formData.locations.filter((_, i) => i !== index);
    setFormData({ ...formData, locations: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const bodyLines = [
      `Requester: ${formData.name}`,
      `Email: ${formData.email}`,
      formData.billingEmail && `Billing Email: ${formData.billingEmail}`,
      formData.phone && `Phone: ${formData.phone}`,
      `Date Range: ${formData.fromDate} to ${formData.toDate}`,
      '',
    ];

    formData.locations.forEach((loc, i) => {
      bodyLines.push(`Location ${i + 1}:`);
      bodyLines.push(`- Name: ${loc.locationName}`);
      bodyLines.push(`- Latitude: ${loc.latitude}`);
      bodyLines.push(`- Longitude: ${loc.longitude}`);
      bodyLines.push(`- Report Types: ${loc.reportTypes.join(', ')}`);
      bodyLines.push('');
    });

    const subject = encodeURIComponent(`${formData.email} Report Request (${formData.locations.length} locations)`);
    const body = encodeURIComponent(bodyLines.filter(Boolean).join('\n'));
    const mailto = `mailto:support@waterwatchpro.com?subject=${subject}&body=${body}`;

    window.location.href = mailto;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-8 text-center text-2xl">
        <img src="https://waterwatchpro25.com/logo.png" className="max-w-[250px]" alt="Logo" />
        Your report will arrive in 24-48 Hours. Thanks!
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-md mt-10">
      <img src="https://waterwatchpro25.com/logo.png" alt="WaterWatchPro Logo" className="mx-auto mb-6 max-w-[250px]" />
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-semibold">Requester Info</h2>
        <input type="text" name="name" required placeholder="Name" value={formData.name} onChange={handleChange} className="input" />
        <input type="email" name="email" required placeholder="Email address" value={formData.email} onChange={handleChange} className="input" />
        <input type="email" name="billingEmail" placeholder="Billing email (optional)" value={formData.billingEmail} onChange={handleChange} className="input" />
        <input type="text" name="phone" placeholder="Phone number" value={formData.phone} onChange={handleChange} className="input" />

        <h2 className="text-xl font-semibold pt-4">Data Request</h2>
        <input type="date" name="fromDate" required value={formData.fromDate} onChange={handleChange} className="input" />
        <input type="date" name="toDate" required value={formData.toDate} onChange={handleChange} className="input" />

        {formData.locations.map((loc, i) => (
          <div key={i} className="border p-4 rounded-md relative">
            {formData.locations.length > 1 && (
              <button
                type="button"
                className="absolute top-2 right-2 text-white bg-red-500 px-2 py-1 rounded"
                onClick={() => removeLocation(i)}
              >
                X
              </button>
            )}
            <input type="number" step="any" required placeholder="Latitude" value={loc.latitude} onChange={(e) => handleChange(e, i, 'latitude')} className="input" />
            <input type="number" step="any" required placeholder="Longitude" value={loc.longitude} onChange={(e) => handleChange(e, i, 'longitude')} className="input" />
            <input type="text" required placeholder="Location Name" value={loc.locationName} onChange={(e) => handleChange(e, i, 'locationName')} className="input" />

            <div className="pt-2">
              {['daily', 'hourly', '15min'].map((type) => (
                <label key={type} className="mr-4">
                  <input
                    type="checkbox"
                    checked={loc.reportTypes.includes(type)}
                    onChange={() => handleCheckboxChange(i, type)}
                    className="mr-1"
                  />
                  {type.charAt(0).toUpperCase() + type.slice(1)} totals
                </label>
              ))}
            </div>
          </div>
        ))}

        <button type="button" onClick={addLocation} className="bg-blue-600 text-white py-2 px-4 rounded mt-4">+ Add Location</button>
        <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded mt-2">Submit Request</button>
      </form>
    </div>
  );
};

export default AnonymousReportForm;
