export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  taxNumber?: string;
  logo?: string;
}

// Configuration de l'entreprise - À personnaliser selon vos besoins
export const companyConfig: CompanyInfo = {
  name: "Votre Entreprise SARL",
  address: "123 Rue Principale, 10000 Ville, Maroc",
  phone: "+212 5 24 12 34 56",
  email: "contact@votreentreprise.ma",
  website: "www.votreentreprise.ma",
  taxNumber: "MA123456789",
  logo: "/logo.png" // Chemin vers votre logo (optionnel)
};

export default companyConfig;
