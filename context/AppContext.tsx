import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { User, Application, Complaint, Role, ApplicationStatus, RegistryRecord, ApplicationType, IdStatus, MasterlistRecord } from '../types';
import { calculateAge } from '../services/dateUtils';
import { INITIAL_USERS, INITIAL_APPLICATIONS, INITIAL_COMPLAINTS, INITIAL_REGISTRY_RECORDS, INITIAL_MASTERLIST_RECORDS, INITIAL_ID_ISSUANCES } from '../services/mockData';

const API_BASE_URL = 'https://api-dbosca.phoenix.com.ph/api/applications';
const MASTERLIST_URL = 'https://api-dbosca.phoenix.com.ph/api/masterlist';
const AUTH_URL = 'https://api-dbosca.phoenix.com.ph/api/auth/login';
const ID_ISSUANCES_URL = 'https://api-dbosca.phoenix.com.ph/api/id-issuances';
const FEMALE_AVATAR = 'https://dev2.phoenix.com.ph/wp-content/uploads/2026/01/istockphoto-1329844196-612x612-1.jpg';

// The specific Birth Registry Proxy API provided by the user
const LCR_API_BASE = 'https://api-dbosca.phoenix.com.ph/api/proxy/birth';

interface AppContextType {
  currentUser: User | null;
  login: (username: string, password: string) => Promise<User | null>;
  logout: () => void;
  users: User[];
  applications: Application[];
  idIssuances: Application[];
  complaints: Complaint[];
  registryRecords: RegistryRecord[];
  masterlistRecords: MasterlistRecord[];
  addApplication: (app: Omit<Application, 'id' | 'status' | 'date'> & { status?: ApplicationStatus }) => Promise<{ ok: boolean; error?: string }>;
  addIdIssuance: (app: Omit<Application, 'id' | 'status' | 'date'>) => Promise<{ ok: boolean; error?: string }>;
  updateApplicationStatus: (id: string, status: ApplicationStatus, reason?: string) => Promise<void>;
  updateApplicationData: (id: string, updates: any) => Promise<{ ok: boolean; error?: string }>;
  addComplaint: (complaint: Omit<Complaint, 'id' | 'status' | 'date'>) => void;
  verifyIdentity: (id: string) => RegistryRecord | undefined;
  issueIdCard: (appId: string) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  syncApplications: () => Promise<void>;
  syncIdIssuances: () => Promise<void>;
  fetchMasterlist: () => Promise<void>;
  fetchExternalRegistry: (type: 'LCR' | 'PWD', recordType?: string, search?: string, page?: number) => Promise<void>;
  syncError: string | null;
  actionError: string | null;
  setActionError: (err: string | null) => void;
  registryError: string | null;
  isLiveMode: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('osca_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [applications, setApplications] = useState<Application[]>(INITIAL_APPLICATIONS);
  const [idIssuances, setIdIssuances] = useState<Application[]>(INITIAL_ID_ISSUANCES);
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [registryRecords, setRegistryRecords] = useState<RegistryRecord[]>(INITIAL_REGISTRY_RECORDS);
  const [masterlistRecords, setMasterlistRecords] = useState<MasterlistRecord[]>(INITIAL_MASTERLIST_RECORDS);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [registryError, setRegistryError] = useState<string | null>(null);
  const [isLiveMode, setIsLiveMode] = useState<boolean>(true);

  const getAuthHeaders = useCallback(() => {
    const headers: any = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    };
    
    const token = localStorage.getItem('osca_auth_token');
    if (token && token !== 'null' && token !== 'undefined' && token !== '') {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, []);

  const normalizeIdentity = (record: any) => {
    const apiFormData = record.formData ? (typeof record.formData === 'string' ? JSON.parse(record.formData) : record.formData) : (record.form_data || {});
    
    // Explicit Database Column Priority
    const firstName = record.first_name || record.firstName || apiFormData.firstName || record.firstname || '';
    const lastName = record.last_name || record.lastName || apiFormData.lastName || record.lastname || '';
    const middleName = record.middle_name || record.middleName || apiFormData.middleName || record.middlename || '';
    const suffix = record.suffix || record.extension || apiFormData.suffix || '';
    const birthDate = record.birthdate || record.birth_date || record.birthDate || record.birthday || record.dob || apiFormData.birthDate || '';
    const dbStatus = record.id_status || record.ID_Status || record.status || record.application_status || apiFormData.status || 'Pending';

    const fullName = record.fullname || record.name || record.full_name || record.fullName || `${firstName} ${lastName}`.trim();

    return {
      firstName,
      lastName,
      middleName,
      suffix,
      birthDate,
      fullName,
      status: dbStatus,
      seniorIdNumber: record.scid_number || record.scid_Number || record.SCID_Number || record.senior_id_number || record.seniorIdNumber || record.senior_id || '',
      formData: {
        ...apiFormData,
        // Map Database specific columns for direct UI reflection as requested
        scid_number: record.scid_number || record.scid_Number || record.SCID_Number || apiFormData.scid_number || '',
        last_name: lastName,
        first_name: firstName,
        birthdate: birthDate,
        status: dbStatus,
        // Keep camelCase for internal application logic
        firstName,
        lastName,
        middleName,
        suffix,
        birthDate,
        birthPlace: apiFormData.birthPlace || apiFormData.birthplace || record.birthplace || record.birth_place || '',
        sex: apiFormData.sex || record.gender || record.sex || '',
        civilStatus: apiFormData.civilStatus || record.civil_status || '',
        citizenship: apiFormData.citizenship || record.citizenship || 'Filipino',
        address: apiFormData.address || record.address || '',
        contactNumber: apiFormData.contactNumber || apiFormData.contact_number || record.contact_number || '',
        email: apiFormData.email || record.email || ''
      }
    };
  };

  const syncIdIssuances = useCallback(async () => {
    // API removed - using local data
    setIsLiveMode(true);
  }, []);

  const fetchMasterlist = useCallback(async () => {
    // API removed - using local data
    setIsLiveMode(true);
  }, []);

  const fetchExternalRegistry = useCallback(async (type: 'LCR' | 'PWD', recordType: string = 'birth', search: string = '', page: number = 1) => {
    // API removed - using local data
    setIsLiveMode(true);
  }, []);

  const syncApplications = useCallback(async () => {
    // API removed - using local data
    setIsLiveMode(true);
  }, []);

  const login = async (username: string, password: string): Promise<User | null> => {
    // Local login implementation
    let user = users.find(u => u.username === username && u.password === password);
    
    // Check masterlist for citizen credentials if not found in users
    if (!user) {
      const citizen = masterlistRecords.find(r => r.username === username && r.password === password);
      if (citizen) {
        user = {
          id: citizen.id,
          username: citizen.username!,
          password: citizen.password!,
          name: citizen.fullName,
          email: citizen.email || `${citizen.username}@citizen.osca.gov`,
          role: Role.CITIZEN
        };
      }
    }

    if (user) {
      setCurrentUser(user);
      localStorage.setItem('osca_current_user', JSON.stringify(user));
      return user;
    }
    return null;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('osca_current_user');
    localStorage.removeItem('osca_auth_token');
  };

  const addApplication = async (app: Omit<Application, 'id' | 'status' | 'date'> & { status?: ApplicationStatus }): Promise<{ ok: boolean; error?: string }> => {
    const newApp: Application = trimObject({
      ...app,
      id: `app_${Date.now()}`,
      status: app.status || ApplicationStatus.PENDING,
      date: new Date().toISOString().split('T')[0]
    });
    setApplications(prev => [newApp, ...prev]);
    return { ok: true };
  };

  const addIdIssuance = async (app: Omit<Application, 'id' | 'status' | 'date'>): Promise<{ ok: boolean; error?: string }> => {
    const newIssuance: Application = trimObject({
      ...app,
      id: `iss_${Date.now()}`,
      status: ApplicationStatus.PENDING,
      date: new Date().toISOString().split('T')[0]
    });
    setIdIssuances(prev => [newIssuance, ...prev]);

    // Update Masterlist ID Status to Pending
    if (newIssuance.formData) {
      const fd = newIssuance.formData;
      const fullName = `${fd.lastName}, ${fd.firstName} ${fd.middleName}`.toUpperCase().trim();
      setMasterlistRecords(prevMaster => {
        const existingIdx = prevMaster.findIndex(r => r.id === newIssuance.userId || (r.fullName === fullName && r.birthDate === fd.birthDate));
        if (existingIdx >= 0) {
          const updatedMaster = [...prevMaster];
          updatedMaster[existingIdx] = { ...updatedMaster[existingIdx], id_status: IdStatus.PENDING };
          return updatedMaster;
        }
        return prevMaster;
      });
    }

    return { ok: true };
  };

  const generateNextScid = useCallback((currentMasterlist: any[]) => {
    const scids = currentMasterlist
      .map(r => {
        const match = String(r.scid_number || '').match(/SCID-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => n > 0);
    
    const maxId = scids.length > 0 ? Math.max(...scids) : 0;
    const nextId = maxId + 1;
    return `SCID-${String(nextId).padStart(6, '0')}`;
  }, []);

  const trimObject = useCallback((obj: any): any => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => trimObject(item));
    }

    const trimmed: any = {};
    Object.keys(obj).forEach(key => {
      const val = obj[key];
      if (typeof val === 'string') {
        trimmed[key] = val.trim();
      } else if (typeof val === 'object') {
        trimmed[key] = trimObject(val);
      } else {
        trimmed[key] = val;
      }
    });
    return trimmed;
  }, []);

  const isValidIdStatus = (status: any): status is IdStatus => {
    return Object.values(IdStatus).includes(status as IdStatus);
  };

  const updateApplicationStatus = async (id: string, status: ApplicationStatus, reason?: string) => {
    let appToUpdate: Application | undefined;
    let isIdIssuance = id.startsWith('iss_');

    // Find the application in either state
    appToUpdate = applications.find(a => a.id === id) || idIssuances.find(a => a.id === id);
    if (!appToUpdate) return;

    let generatedScid = appToUpdate.formData?.scid_number || '';
    if (status === ApplicationStatus.APPROVED && !generatedScid) {
      generatedScid = generateNextScid(masterlistRecords);
    }

    const updateFunc = (prev: Application[]) => prev.map(a => {
      if (a.id === id) {
        let updatedApp = { ...a, status, rejectionReason: reason || '' };
        if (generatedScid && updatedApp.formData) {
          updatedApp.formData = { ...updatedApp.formData, scid_number: generatedScid };
        }
        return trimObject(updatedApp);
      }
      return a;
    });

    if (isIdIssuance) {
      setIdIssuances(updateFunc);
    } else {
      setApplications(updateFunc);
    }

    // Sync to Masterlist
    if (appToUpdate.formData) {
      const fd = appToUpdate.formData;
      const fullName = `${fd.lastName || ''}, ${fd.firstName || ''} ${fd.middleName || ''}`.toUpperCase().trim();
      
      setMasterlistRecords(prevMaster => {
        const existingIdx = prevMaster.findIndex(r => r.id === appToUpdate?.userId || (r.fullName === fullName && r.birthDate === fd.birthDate));
        
        if (status === ApplicationStatus.APPROVED) {
          const existingRecord = existingIdx >= 0 ? prevMaster[existingIdx] : null;
          
          // Generate credentials only if they don't exist
          const username = existingRecord?.username || 
            ((fd.firstName || '').substring(0, 1) + (fd.lastName || '').replace(/\s/g, '')).toLowerCase() + Math.floor(1000 + Math.random() * 9000);
          const password = existingRecord?.password || Math.random().toString(36).slice(-8);

          let id_status: IdStatus = isIdIssuance ? IdStatus.APPROVED : IdStatus.NEW;
          const newMasterRecord: MasterlistRecord = {
            id: appToUpdate?.userId || `m_${Date.now()}`,
            fullName,
            firstName: (fd.firstName || '').toUpperCase().trim(),
            lastName: (fd.lastName || '').toUpperCase().trim(),
            middleName: (fd.middleName || '').toUpperCase().trim(),
            birthDate: fd.birthDate || '',
            birthPlace: (fd.birthPlace || '').toUpperCase().trim(),
            seniorIdNumber: generatedScid,
            scid_number: generatedScid,
            id_status,
            address: `${fd.houseNo || ''} ${fd.street || ''}, BRGY. ${fd.barangay || ''}, ${fd.city || 'SAN JUAN CITY'}, ${fd.province || 'METRO MANILA'}`.toUpperCase().trim(),
            house_no: (fd.houseNo || '').toUpperCase().trim(),
            street: (fd.street || '').toUpperCase().trim(),
            barangay: (fd.barangay || '').toUpperCase().trim(),
            city_municipality: (fd.city || 'SAN JUAN CITY').toUpperCase().trim(),
            province: (fd.province || 'METRO MANILA').toUpperCase().trim(),
            district: (fd.district || '').toUpperCase().trim(),
            email: (fd.email || '').toLowerCase().trim(),
            contact_number: (fd.contactNumber || '').trim(),
            sex: fd.sex?.toUpperCase().trim(),
            civilStatus: fd.civilStatus?.toUpperCase().trim(),
            username,
            password
          };

          if (existingIdx >= 0) {
            const updatedMaster = [...prevMaster];
            updatedMaster[existingIdx] = newMasterRecord;
            return updatedMaster;
          } else {
            return [...prevMaster, newMasterRecord];
          }
        } else if (status === ApplicationStatus.REJECTED) {
          if (existingIdx >= 0) {
            const updatedMaster = [...prevMaster];
            updatedMaster[existingIdx] = { ...updatedMaster[existingIdx], id_status: IdStatus.REJECTED };
            return updatedMaster;
          }
        } else if (status === ApplicationStatus.ISSUED) {
          if (existingIdx >= 0) {
            const updatedMaster = [...prevMaster];
            updatedMaster[existingIdx] = { 
              ...updatedMaster[existingIdx], 
              id_status: IdStatus.RELEASED,
              releasedDate: new Date().toISOString()
            };
            return updatedMaster;
          }
        }
        return prevMaster;
      });
    }
  };

  const updateApplicationData = async (id: string, updates: any): Promise<{ ok: boolean; error?: string }> => {
    setApplications(prev => {
      const updatedApps = prev.map(a => a.id === id ? trimObject({ ...a, ...updates }) : a);
      
      // If the updated application is APPROVED, sync the changes to Masterlist
      const app = updatedApps.find(a => a.id === id);
      if (app && app.status === ApplicationStatus.APPROVED && app.formData) {
        const fd = app.formData;
        const fullName = `${fd.lastName}, ${fd.firstName} ${fd.middleName}`.toUpperCase().trim();
        const scid = fd.scid_number || '';

        setMasterlistRecords(prevMaster => {
          const existingIdx = prevMaster.findIndex(r => r.id === app.userId || (r.fullName === fullName && r.birthDate === fd.birthDate));
          if (existingIdx >= 0) {
            const updatedMaster = [...prevMaster];
            const currentStatus = updatedMaster[existingIdx].id_status;
            
            // If status is being updated, validate it
            const newStatus = updates.id_status || currentStatus;
            if (!isValidIdStatus(newStatus)) {
              setActionError('Invalid ID Status');
              return prevMaster;
            }

            updatedMaster[existingIdx] = {
              ...updatedMaster[existingIdx],
              fullName,
              firstName: fd.firstName.toUpperCase().trim(),
              lastName: fd.lastName.toUpperCase().trim(),
              middleName: fd.middleName.toUpperCase().trim(),
              birthDate: fd.birthDate,
              birthPlace: (fd.birthPlace || '').toUpperCase().trim(),
              seniorIdNumber: scid,
              scid_number: scid,
              id_status: newStatus,
              address: `${fd.houseNo || ''} ${fd.street || ''}, BRGY. ${fd.barangay || ''}, ${fd.city || 'SAN JUAN CITY'}, ${fd.province || 'METRO MANILA'}`.toUpperCase().trim(),
              house_no: (fd.houseNo || '').toUpperCase().trim(),
              street: (fd.street || '').toUpperCase().trim(),
              barangay: (fd.barangay || '').toUpperCase().trim(),
              city_municipality: (fd.city || 'SAN JUAN CITY').toUpperCase().trim(),
              province: (fd.province || 'METRO MANILA').toUpperCase().trim(),
              district: (fd.district || '').toUpperCase().trim(),
              email: (fd.email || '').toLowerCase().trim(),
              contact_number: (fd.contactNumber || '').trim(),
              sex: fd.sex?.toUpperCase().trim(),
              civilStatus: fd.civilStatus?.toUpperCase().trim(),
              formData: fd
            };
            return updatedMaster;
          }
          return prevMaster;
        });
      }
      
      return updatedApps;
    });

    setIdIssuances(prev => prev.map(a => a.id === id ? trimObject({ ...a, ...updates }) : a));
    return { ok: true };
  };

  const addComplaint = (complaint: Omit<Complaint, 'id' | 'status' | 'date'>) => {
    setComplaints(prev => [{ ...complaint, id: `comp_${Date.now()}`, status: 'Open', date: new Date().toISOString().split('T')[0] }, ...(prev || [])]);
  };

  const verifyIdentity = (id: string) => registryRecords.find(r => r.id === id);

  const issueIdCard = (appId: string) => {
    const releasedDate = new Date().toISOString();
    setApplications(prev => {
      const app = prev.find(a => a.id === appId);
      if (app && app.formData) {
        const fd = app.formData;
        const fullName = `${fd.lastName || ''}, ${fd.firstName || ''} ${fd.middleName || ''}`.toUpperCase().trim();
        setMasterlistRecords(prevMaster => {
          const existingIdx = prevMaster.findIndex(r => r.id === app.userId || (r.fullName === fullName && r.birthDate === fd.birthDate));
          if (existingIdx >= 0) {
            const updatedMaster = [...prevMaster];
            updatedMaster[existingIdx] = { 
              ...updatedMaster[existingIdx], 
              id_status: IdStatus.RELEASED,
              releasedDate 
            };
            return updatedMaster;
          }
          return prevMaster;
        });
      }
      return prev.map(a => a.id === appId ? { ...a, status: ApplicationStatus.ISSUED, releasedDate } : a);
    });
    setIdIssuances(prev => prev.map(a => a.id === appId ? { ...a, status: ApplicationStatus.ISSUED, releasedDate } : a));
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => (prev || []).map(u => u.id === userId ? { ...u, ...updates } : u));
    if (currentUser?.id === userId) setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
  };

  useEffect(() => {
    if (currentUser && currentUser.role !== Role.CITIZEN) {
      syncApplications();
      syncIdIssuances();
      fetchMasterlist();
    }
  }, [currentUser, syncApplications, syncIdIssuances, fetchMasterlist]);

  return (
    <AppContext.Provider value={{
      currentUser, login, logout, users, applications, idIssuances, complaints,
      registryRecords, masterlistRecords, addApplication, updateApplicationStatus,
      updateApplicationData, addComplaint, verifyIdentity, issueIdCard, updateUser,
      syncApplications, syncIdIssuances, fetchMasterlist, fetchExternalRegistry, syncError, 
      addIdIssuance,
      actionError, setActionError, registryError, isLiveMode
    }}>
      {children}
    </AppContext.Provider>
  );
};