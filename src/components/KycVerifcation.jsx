import React, { useState } from 'react';
import { CheckCircle, AlertCircle, User, CreditCard } from 'lucide-react';

const KycVerification = () => {
  const [panNumber, setPanNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [panVerified, setPanVerified] = useState(false);
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [panData, setPanData] = useState(null);
  const [aadhaarData, setAadhaarData] = useState(null);
  const [loading, setLoading] = useState({ pan: false, aadhaar: false });
  const [errors, setErrors] = useState({ pan: '', aadhaar: '' });

  // Mock database for demonstration
  const mockPanData = {
    'ABCDE1234F': {
      name: 'RAJESH KUMAR SHARMA',
      dob: '15/08/1985',
      category: 'Individual',
      status: 'Valid'
    },
    'XYZPQ9876A': {
      name: 'PRIYA SINGH',
      dob: '22/03/1990',
      category: 'Individual', 
      status: 'Valid'
    }
  };

  const mockAadhaarData = {
    '123456789012': {
      name: 'Rajesh Kumar Sharma',
      dob: '15/08/1985',
      gender: 'Male',
      address: '123, MG Road, Indore, Madhya Pradesh - 452001',
      mobile: '98XXXXXXXX',
      photo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZjBmMGYwIi8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjE1IiBmaWxsPSIjNjY2Ii8+CjxwYXRoIGQ9Im0zNSA3MGMwLTgtNy0xNS0xNS0xNWgwYy04IDAtMTUgNy0xNSAxNSIgZmlsbD0iIzY2NiIvPgo8L3N2Zz4='
    },
    '987654321098': {
      name: 'Priya Singh',
      dob: '22/03/1990',
      gender: 'Female',
      address: '456, AB Road, Bhopal, Madhya Pradesh - 462001',
      mobile: '99XXXXXXXX',
      photo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZjBmMGYwIi8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjE1IiBmaWxsPSIjNjY2Ii8+CjxwYXRoIGQ9Im0zNSA3MGMwLTgtNy0xNS0xNS0xNWgwYy04IDAtMTUgNy0xNSAxNSIgZmlsbD0iIzY2NiIvPgo8L3N2Zz4='
    }
  };

  const validatePAN = (pan) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  };

  const validateAadhaar = (aadhaar) => {
    const aadhaarRegex = /^[0-9]{12}$/;
    return aadhaarRegex.test(aadhaar.replace(/\s/g, ''));
  };

  const formatAadhaar = (value) => {
    const cleanValue = value.replace(/\D/g, '');
    const formatted = cleanValue.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.substring(0, 14);
  };

  const verifyPAN = async () => {
    if (!validatePAN(panNumber)) {
      setErrors(prev => ({ ...prev, pan: 'Invalid PAN format' }));
      return;
    }

    setLoading(prev => ({ ...prev, pan: true }));
    setErrors(prev => ({ ...prev, pan: '' }));

    // Simulate API call
    setTimeout(() => {
      const data = mockPanData[panNumber];
      if (data) {
        setPanData(data);
        setPanVerified(true);
        setErrors(prev => ({ ...prev, pan: '' }));
      } else {
        setErrors(prev => ({ ...prev, pan: 'PAN not found in database' }));
        setPanVerified(false);
        setPanData(null);
      }
      setLoading(prev => ({ ...prev, pan: false }));
    }, 1500);
  };

  const verifyAadhaar = async () => {
    const cleanAadhaar = aadhaarNumber.replace(/\s/g, '');
    if (!validateAadhaar(cleanAadhaar)) {
      setErrors(prev => ({ ...prev, aadhaar: 'Invalid Aadhaar format' }));
      return;
    }

    setLoading(prev => ({ ...prev, aadhaar: true }));
    setErrors(prev => ({ ...prev, aadhaar: '' }));

    // Simulate API call
    setTimeout(() => {
      const data = mockAadhaarData[cleanAadhaar];
      if (data) {
        setAadhaarData(data);
        setAadhaarVerified(true);
        setErrors(prev => ({ ...prev, aadhaar: '' }));
      } else {
        setErrors(prev => ({ ...prev, aadhaar: 'Aadhaar not found in database' }));
        setAadhaarVerified(false);
        setAadhaarData(null);
      }
      setLoading(prev => ({ ...prev, aadhaar: false }));
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">KYC Verification</h1>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
          <p className="text-green-800 text-sm">
            As per the Reserve Bank of India (RBI) guidelines, please complete your KYC details with a valid PAN and Aadhaar.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* PAN Details */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <CreditCard className="mr-2 text-blue-600" />
              PAN Details
            </h2>
            
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-600">आयकर विभाग</p>
                  <p className="text-xs text-gray-600">INCOME TAX DEPARTMENT</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">भारत सरकार</p>
                  <p className="text-xs text-gray-600">GOVT. OF INDIA</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PAN NUMBER</label>
                  <input
                    type="text"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    placeholder="Please enter PAN Number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength="10"
                  />
                </div>
                
                <button
                  onClick={verifyPAN}
                  disabled={loading.pan || !panNumber}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center"
                >
                  {loading.pan ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    'Verify PAN'
                  )}
                </button>
                
                {errors.pan && (
                  <div className="flex items-center text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.pan}
                  </div>
                )}
                
                {panVerified && panData && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-green-800 font-medium">PAN Verified Successfully</span>
                    </div>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p><strong>Name:</strong> {panData.name}</p>
                      <p><strong>DOB:</strong> {panData.dob}</p>
                      <p><strong>Category:</strong> {panData.category}</p>
                      <p><strong>Status:</strong> {panData.status}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Aadhaar Details */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <User className="mr-2 text-green-600" />
              Aadhaar Details
            </h2>
            
            <div className="bg-gradient-to-r from-green-100 to-orange-100 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 bg-blue-900 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">भा</span>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600">भारत सरकार</p>
                  <p className="text-xs text-gray-600">GOVERNMENT OF INDIA</p>
                </div>
                <div className="w-8 h-8 bg-red-500 rounded-full"></div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">AADHAAR NUMBER</label>
                  <input
                    type="text"
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(formatAadhaar(e.target.value))}
                    placeholder="Please enter Aadhaar Number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    maxLength="14"
                  />
                </div>
                
                <button
                  onClick={verifyAadhaar}
                  disabled={loading.aadhaar || !aadhaarNumber}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center"
                >
                  {loading.aadhaar ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    'Verify Aadhaar'
                  )}
                </button>
                
                {errors.aadhaar && (
                  <div className="flex items-center text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.aadhaar}
                  </div>
                )}
                
                {aadhaarVerified && aadhaarData && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-green-800 font-medium">Aadhaar Verified Successfully</span>
                    </div>
                    <div className="flex space-x-4">
                      <img 
                        src={aadhaarData.photo} 
                        alt="Profile" 
                        className="w-16 h-16 rounded-md border border-gray-300"
                      />
                      <div className="text-sm text-gray-700 space-y-1 flex-1">
                        <p><strong>Name:</strong> {aadhaarData.name}</p>
                        <p><strong>DOB:</strong> {aadhaarData.dob}</p>
                        <p><strong>Gender:</strong> {aadhaarData.gender}</p>
                        <p><strong>Mobile:</strong> {aadhaarData.mobile}</p>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-700">
                      <p><strong>Address:</strong> {aadhaarData.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Demo Instructions */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 mb-2">Demo Instructions:</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p><strong>Test PAN Numbers:</strong> ABCDE1234F, XYZPQ9876A</p>
            <p><strong>Test Aadhaar Numbers:</strong> 123456789012, 987654321098</p>
            <p className="text-xs mt-2">* This is a demo component. In production, you would connect to actual NSDL/UIDAI APIs for verification.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KycVerification;