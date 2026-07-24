'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Customer } from '@/types';
import { X, UserPlus, Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerToEdit?: Customer;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  customerToEdit,
}) => {
  const { addCustomer, updateCustomer } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [address, setAddress] = useState('');
  const [village, setVillage] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pin, setPin] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [pan, setPan] = useState('');
  const [occupation, setOccupation] = useState('');
  const [employer, setEmployer] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [referencePerson, setReferencePerson] = useState('');
  const [referencePhone, setReferencePhone] = useState('');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState('');
  const [idProof, setIdProof] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (customerToEdit) {
      setName(customerToEdit.name || '');
      setPhone(customerToEdit.phone || '');
      setFatherName(customerToEdit.fatherName || '');
      setAddress(customerToEdit.address || '');
      setVillage(customerToEdit.village || '');
      setCity(customerToEdit.city || '');
      setState(customerToEdit.state || '');
      setPin(customerToEdit.pin || '');
      setAadhaar(customerToEdit.aadhaar || '');
      setPan(customerToEdit.pan || '');
      setOccupation(customerToEdit.occupation || '');
      setEmployer(customerToEdit.employer || '');
      setMonthlyIncome(customerToEdit.monthlyIncome ? customerToEdit.monthlyIncome.toString() : '');
      setReferencePerson(customerToEdit.referencePerson || '');
      setReferencePhone(customerToEdit.referencePhone || '');
      setNotes(customerToEdit.notes || '');
      setPhoto(customerToEdit.photo || '');
      setIdProof(customerToEdit.idProof || '');
    } else {
      resetForm();
    }
  }, [customerToEdit, isOpen]);

  const resetForm = () => {
    setName('');
    setPhone('');
    setFatherName('');
    setAddress('');
    setVillage('');
    setCity('');
    setState('');
    setPin('');
    setAadhaar('');
    setPan('');
    setOccupation('');
    setEmployer('');
    setMonthlyIncome('');
    setReferencePerson('');
    setReferencePhone('');
    setNotes('');
    setPhoto('');
    setIdProof('');
    setError('');
  };

  if (!isOpen) return null;

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (base64: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image file size must be less than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Customer name is mandatory and cannot be empty.');
      return;
    }

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      fatherName: fatherName.trim(),
      address: address.trim(),
      village: village.trim(),
      city: city.trim(),
      state: state.trim(),
      pin: pin.trim(),
      aadhaar: aadhaar.trim(),
      pan: pan.trim(),
      occupation: occupation.trim(),
      employer: employer.trim(),
      monthlyIncome: monthlyIncome ? parseFloat(monthlyIncome) : 0,
      referencePerson: referencePerson.trim(),
      referencePhone: referencePhone.trim(),
      notes: notes.trim(),
      photo,
      idProof,
      status: 'Active' as const,
    };

    if (customerToEdit) {
      const res = updateCustomer({ ...customerToEdit, ...payload });
      if (!res.success) {
        setError(res.error || 'Failed to update customer.');
        return;
      }
    } else {
      const res = addCustomer(payload);
      if (!res.success) {
        setError(res.error || 'Failed to add customer.');
        return;
      }
    }

    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[92vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/20">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {customerToEdit ? 'Edit Customer Profile' : 'Add New Customer'}
            </h2>
            <p className="text-sm text-slate-400">Fill in customer personal and verification details</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/30 text-rose-400 text-sm rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photos Upload Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl">
            {/* Customer Photo */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Customer Photo (Base64)
              </label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl border border-slate-700 bg-slate-900 overflow-hidden flex items-center justify-center text-slate-500">
                  {photo ? (
                    <img src={photo} alt="Customer" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg cursor-pointer transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, setPhoto)}
                    />
                  </label>
                  {photo && (
                    <button
                      type="button"
                      onClick={() => setPhoto('')}
                      className="block text-[11px] text-rose-400 hover:underline mt-1"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ID Proof Image */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                ID Proof Image (Base64)
              </label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl border border-slate-700 bg-slate-900 overflow-hidden flex items-center justify-center text-slate-500">
                  {idProof ? (
                    <img src={idProof} alt="ID Proof" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg cursor-pointer transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload ID</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, setIdProof)}
                    />
                  </label>
                  {idProof && (
                    <button
                      type="button"
                      onClick={() => setIdProof('')}
                      className="block text-[11px] text-rose-400 hover:underline mt-1"
                    >
                      Remove ID
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Primary Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 border-b border-slate-800 pb-1">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Phone Number (Unique)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Father Name
                </label>
                <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="Father / Husband name"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Monthly Income (INR)
                </label>
                <input
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  placeholder="e.g. 25000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Address Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 border-b border-slate-800 pb-1">
              Address & Location
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Street Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House No, Street, Landmark"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Village
                </label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="Village"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City / Town"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  State & PIN Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    className="w-2/3 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  />
                  <input
                    type="text"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="PIN"
                    className="w-1/3 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Verification & Employment */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 border-b border-slate-800 pb-1">
              KYC & Employment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  value={aadhaar}
                  onChange={(e) => setAadhaar(e.target.value)}
                  placeholder="12-digit Aadhaar number"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  PAN Number
                </label>
                <input
                  type="text"
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  placeholder="10-digit PAN number"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 uppercase transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Occupation
                </label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="Business, Service, etc."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Employer / Shop Name
                </label>
                <input
                  type="text"
                  value={employer}
                  onChange={(e) => setEmployer(e.target.value)}
                  placeholder="Employer or Business Name"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Reference & Notes */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 border-b border-slate-800 pb-1">
              Reference & Remarks
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Reference Person
                </label>
                <input
                  type="text"
                  value={referencePerson}
                  onChange={(e) => setReferencePerson(e.target.value)}
                  placeholder="Guarantor / Reference Name"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Reference Phone
                </label>
                <input
                  type="text"
                  value={referencePhone}
                  onChange={(e) => setReferencePhone(e.target.value)}
                  placeholder="Reference phone number"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Notes / Additional Remarks
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special instructions or background details"
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/25 transition"
            >
              {customerToEdit ? 'Save Changes' : 'Create Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
