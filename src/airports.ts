export interface AirportOption {
  code: string;
  city: string;
  name: string;
}

export const BRAZILIAN_AIRPORTS: AirportOption[] = [
  { code: 'GRU', city: 'São Paulo', name: 'Guarulhos (GRU)' },
  { code: 'CGH', city: 'São Paulo', name: 'Congonhas (CGH)' },
  { code: 'GIG', city: 'Rio de Janeiro', name: 'Galeão (GIG)' },
  { code: 'SDU', city: 'Rio de Janeiro', name: 'Santos Dumont (SDU)' },
  { code: 'CNF', city: 'Belo Horizonte', name: 'Confins (CNF)' },
  { code: 'BSB', city: 'Brasília', name: 'Juscelino Kubitschek (BSB)' },
  { code: 'SSA', city: 'Salvador', name: 'Dep. Luís Eduardo Magalhães (SSA)' },
  { code: 'FLN', city: 'Florianópolis', name: 'Hercílio Luz (FLN)' },
  { code: 'POA', city: 'Porto Alegre', name: 'Salgado Filho (POA)' },
  { code: 'REC', city: 'Recife', name: 'Guararapes (REC)' },
  { code: 'FOR', city: 'Fortaleza', name: 'Pinto Martins (FOR)' },
  { code: 'CWB', city: 'Curitiba', name: 'Afonso Pena (CWB)' },
  { code: 'MAO', city: 'Manaus', name: 'Eduardo Gomes (MAO)' },
  { code: 'BEL', city: 'Belém', name: 'Val-de-Cans (BEL)' },
  { code: 'GYN', city: 'Goiânia', name: 'Santa Genoveva (GYN)' }
];
