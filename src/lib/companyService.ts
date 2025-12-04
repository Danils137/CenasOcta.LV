import { supabase } from './supabaseClient';

export type UserCompany = {
  id: string;
  userId: string;
  name: string;
  registrationNumber?: string | null;
  vatNumber?: string | null;
  address?: string | null;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CompanyInput = {
  name: string;
  registrationNumber?: string;
  vatNumber?: string;
  address?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
};

const TABLE_NAME = 'user_companies';

const mapFromDb = (row: any): UserCompany => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  registrationNumber: row.registration_number,
  vatNumber: row.vat_number,
  address: row.address,
  contactPerson: row.contact_person,
  phone: row.phone,
  email: row.email,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapToDb = (userId: string, payload: CompanyInput) => ({
  user_id: userId,
  name: payload.name,
  registration_number: payload.registrationNumber ?? null,
  vat_number: payload.vatNumber ?? null,
  address: payload.address ?? null,
  contact_person: payload.contactPerson ?? null,
  phone: payload.phone ?? null,
  email: payload.email ?? null,
});

export async function listUserCompanies(userId: string): Promise<UserCompany[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapFromDb);
}

export async function createUserCompany(userId: string, payload: CompanyInput): Promise<UserCompany> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(mapToDb(userId, payload))
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return mapFromDb(data);
}

export async function updateUserCompany(
  id: string,
  userId: string,
  payload: CompanyInput
): Promise<UserCompany> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(mapToDb(userId, payload))
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return mapFromDb(data);
}

export async function deleteUserCompany(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
}
