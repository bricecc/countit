import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'fr' | 'de';

const translations = {
  en: {
    app_name: 'CountIt',
    cloud_sync: 'Cloud Sync',
    local_mode: 'Local Mode',
    no_counters_title: 'No counters yet',
    no_counters_msg_cloud: 'Your cloud database is empty.',
    no_counters_msg_local: 'Start tracking locally or sign in to sync.',
    create_first: 'Create First Counter',
    signin_sync: 'Sign in to sync your data',
    create_new: 'Create New Counter',
    name_label: 'Name',
    name_placeholder: 'e.g. Glasses of Water, Pushups',
    category_label: 'Category',
    track_time_label: 'Log date and time of every count',
    start_counting: 'Start Counting',
    settings_title: 'Settings & Data',
    account_sync: 'Account Sync',
    connected_server: 'Connected to Server',
    sign_out: 'Sign Out',
    sign_in_desc: 'Sign in to access your counters from any device. Counters are stored locally until you sign in.',
    sign_in_reg: 'Sign In / Register',
    portable_db: 'Portable Database',
    export_desc: 'Export your current view (Local or Cloud) as a JSON file.',
    export_json: 'Export JSON',
    import_json: 'Import JSON',
    language: 'Language',
    cat_General: 'General',
    cat_Health: 'Health',
    cat_Habits: 'Habits',
    cat_Work: 'Work',
    cat_Social: 'Social',
    cat_Fitness: 'Fitness',
    counter_details: 'Counter Details',
    current_count: 'Current Count',
    history_log: 'History Log',
    timestamps_disabled: 'Timestamps are disabled for this counter.',
    no_history: 'No history yet. Start counting!',
    incremented: 'Incremented',
    delete_question: 'Delete this counter?',
    delete_warning: 'This action cannot be undone.',
    cancel: 'Cancel',
    confirm_delete: 'Confirm Delete',
    delete_counter: 'Delete Counter',
    save: 'Save',
    welcome_back: 'Welcome Back',
    create_account: 'Create Account',
    username: 'Username',
    email: 'Email',
    password: 'Password',
    sign_in_btn: 'Sign In',
    sign_up_btn: 'Sign Up',
    no_account: "Don't have an account?",
    has_account: "Already have an account?",
    login_link: 'Log In',
    signup_link: 'Sign Up',
    tracks_time: 'Tracks time',
    import_success: 'Import successful! Data merged.',
    import_fail: 'Failed to import file. Invalid format.',
    confirm_merge: 'Found {n} counters. Merge with existing?'
  },
  fr: {
    app_name: 'CountIt',
    cloud_sync: 'Synchro Cloud',
    local_mode: 'Mode Local',
    no_counters_title: 'Pas de compteurs',
    no_counters_msg_cloud: 'Votre base de données cloud est vide.',
    no_counters_msg_local: 'Commencez le suivi localement ou connectez-vous.',
    create_first: 'Créer un premier compteur',
    signin_sync: 'Connectez-vous pour synchroniser',
    create_new: 'Nouveau Compteur',
    name_label: 'Nom',
    name_placeholder: 'ex. Verres d\'eau, Pompes',
    category_label: 'Catégorie',
    track_time_label: 'Enregistrer la date et l\'heure de chaque ajout',
    start_counting: 'Commencer',
    settings_title: 'Paramètres & Données',
    account_sync: 'Compte & Synchro',
    connected_server: 'Connecté au serveur',
    sign_out: 'Déconnexion',
    sign_in_desc: 'Connectez-vous pour accéder à vos compteurs partout. Les données sont locales tant que vous n\'êtes pas connecté.',
    sign_in_reg: 'Connexion / Inscription',
    portable_db: 'Base de données portable',
    export_desc: 'Exportez votre vue actuelle (Locale ou Cloud) en fichier JSON.',
    export_json: 'Exporter JSON',
    import_json: 'Importer JSON',
    language: 'Langue',
    cat_General: 'Général',
    cat_Health: 'Santé',
    cat_Habits: 'Habitudes',
    cat_Work: 'Travail',
    cat_Social: 'Social',
    cat_Fitness: 'Fitness',
    counter_details: 'Détails du compteur',
    current_count: 'Compte actuel',
    history_log: 'Historique',
    timestamps_disabled: 'L\'horodatage est désactivé pour ce compteur.',
    no_history: 'Pas d\'historique. Commencez à compter !',
    incremented: 'Ajouté',
    delete_question: 'Supprimer ce compteur ?',
    delete_warning: 'Cette action est irréversible.',
    cancel: 'Annuler',
    confirm_delete: 'Confirmer la suppression',
    delete_counter: 'Supprimer le compteur',
    save: 'Enregistrer',
    welcome_back: 'Bon retour',
    create_account: 'Créer un compte',
    username: 'Nom d\'utilisateur',
    email: 'Email',
    password: 'Mot de passe',
    sign_in_btn: 'Se connecter',
    sign_up_btn: 'S\'inscrire',
    no_account: "Pas de compte ?",
    has_account: "Déjà un compte ?",
    login_link: 'Connexion',
    signup_link: 'Inscription',
    tracks_time: 'Suit le temps',
    import_success: 'Import réussi ! Données fusionnées.',
    import_fail: 'Échec de l\'import. Format invalide.',
    confirm_merge: '{n} compteurs trouvés. Fusionner avec l\'existant ?'
  },
  de: {
    app_name: 'CountIt',
    cloud_sync: 'Cloud Sync',
    local_mode: 'Lokalmodus',
    no_counters_title: 'Keine Zähler',
    no_counters_msg_cloud: 'Ihre Cloud-Datenbank ist leer.',
    no_counters_msg_local: 'Starten Sie lokal oder melden Sie sich an.',
    create_first: 'Ersten Zähler erstellen',
    signin_sync: 'Anmelden zum Synchronisieren',
    create_new: 'Neuer Zähler',
    name_label: 'Name',
    name_placeholder: 'z.B. Gläser Wasser, Liegestütze',
    category_label: 'Kategorie',
    track_time_label: 'Datum und Zeit jeder Zählung speichern',
    start_counting: 'Zählen starten',
    settings_title: 'Einstellungen & Daten',
    account_sync: 'Konto-Sync',
    connected_server: 'Verbunden mit Server',
    sign_out: 'Abmelden',
    sign_in_desc: 'Melden Sie sich an, um von jedem Gerät zuzugreifen. Daten werden lokal gespeichert, bis Sie sich anmelden.',
    sign_in_reg: 'Anmelden / Registrieren',
    portable_db: 'Portable Datenbank',
    export_desc: 'Exportieren Sie Ihre aktuelle Ansicht (Lokal oder Cloud) als JSON.',
    export_json: 'JSON Exportieren',
    import_json: 'JSON Importieren',
    language: 'Sprache',
    cat_General: 'Allgemein',
    cat_Health: 'Gesundheit',
    cat_Habits: 'Gewohnheiten',
    cat_Work: 'Arbeit',
    cat_Social: 'Sozial',
    cat_Fitness: 'Fitness',
    counter_details: 'Zählerdetails',
    current_count: 'Aktueller Stand',
    history_log: 'Verlauf',
    timestamps_disabled: 'Zeitstempel sind für diesen Zähler deaktiviert.',
    no_history: 'Noch kein Verlauf. Fangen Sie an zu zählen!',
    incremented: 'Erhöht',
    delete_question: 'Diesen Zähler löschen?',
    delete_warning: 'Diese Aktion kann nicht rückgängig gemacht werden.',
    cancel: 'Abbrechen',
    confirm_delete: 'Löschen bestätigen',
    delete_counter: 'Zähler löschen',
    save: 'Speichern',
    welcome_back: 'Willkommen zurück',
    create_account: 'Konto erstellen',
    username: 'Benutzername',
    email: 'E-Mail',
    password: 'Passwort',
    sign_in_btn: 'Anmelden',
    sign_up_btn: 'Registrieren',
    no_account: "Kein Konto?",
    has_account: "Bereits ein Konto?",
    login_link: 'Anmelden',
    signup_link: 'Registrieren',
    tracks_time: 'Zeit erfassen',
    import_success: 'Import erfolgreich! Daten zusammengeführt.',
    import_fail: 'Import fehlgeschlagen. Ungültiges Format.',
    confirm_merge: '{n} Zähler gefunden. Mit bestehenden zusammenführen?'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en'], params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('fr');

  useEffect(() => {
    const stored = localStorage.getItem('countit_lang');
    if (stored && (stored === 'en' || stored === 'fr' || stored === 'de')) {
      setLanguageState(stored as Language);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('countit_lang', lang);
  };

  const t = (key: keyof typeof translations['en'], params?: Record<string, string | number>) => {
    let text = translations[language][key] || translations['en'][key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};