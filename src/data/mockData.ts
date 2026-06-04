import type { Member, Transaction, ChurchEvent, Group, Attendance } from '../types'

export const mockMembers: Member[] = [
  { id: '1', firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@email.com', phone: '0612345678', address: '12 Rue de la Paix, Paris', birthDate: '1985-03-15', joinDate: '2018-01-10', status: 'actif', role: 'ancien', groups: ['1', '2'], notes: 'Trésorier de l\'église' },
  { id: '2', firstName: 'Marie', lastName: 'Martin', email: 'marie.martin@email.com', phone: '0698765432', address: '8 Avenue Victor Hugo, Lyon', birthDate: '1990-07-22', joinDate: '2019-06-15', status: 'actif', role: 'responsable', groups: ['2', '3'], notes: 'Responsable de la chorale' },
  { id: '3', firstName: 'Paul', lastName: 'Bernard', email: 'paul.bernard@email.com', phone: '0756123456', address: '5 Rue du Commerce, Marseille', birthDate: '1978-11-08', joinDate: '2015-03-20', status: 'actif', role: 'pasteur', groups: ['1'], notes: 'Pasteur principal' },
  { id: '4', firstName: 'Sophie', lastName: 'Leblanc', email: 'sophie.leblanc@email.com', phone: '0634567890', address: '23 Boulevard Haussmann, Paris', birthDate: '1995-01-30', joinDate: '2021-09-05', status: 'actif', role: 'membre', groups: ['3', '4'] },
  { id: '5', firstName: 'Pierre', lastName: 'Moreau', email: 'pierre.moreau@email.com', phone: '0789012345', address: '15 Rue de Rivoli, Paris', birthDate: '1988-05-12', joinDate: '2020-02-18', status: 'actif', role: 'diacre', groups: ['1', '4'] },
  { id: '6', firstName: 'Claire', lastName: 'Simon', email: 'claire.simon@email.com', phone: '0645678901', address: '7 Place Bellecour, Lyon', birthDate: '1992-09-25', joinDate: '2022-04-12', status: 'actif', role: 'membre', groups: ['2'] },
  { id: '7', firstName: 'Thomas', lastName: 'Petit', email: 'thomas.petit@email.com', phone: '0712345678', address: '30 Rue de la République, Nantes', birthDate: '2000-12-01', joinDate: '2023-01-08', status: 'actif', role: 'membre', groups: ['4', '5'] },
  { id: '8', firstName: 'Isabelle', lastName: 'Durand', email: 'isabelle.durand@email.com', phone: '0623456789', address: '18 Avenue Foch, Nice', birthDate: '1982-06-18', joinDate: '2017-11-25', status: 'inactif', role: 'membre', groups: [] },
  { id: '9', firstName: 'Marc', lastName: 'Rousseau', email: 'marc.rousseau@email.com', phone: '0698012345', address: '9 Rue Sainte-Catherine, Bordeaux', birthDate: '1975-04-03', joinDate: '2016-08-14', status: 'actif', role: 'ancien', groups: ['1', '3'] },
  { id: '10', firstName: 'Lucie', lastName: 'Vincent', email: 'lucie.vincent@email.com', phone: '0756789012', address: '22 Rue du Palais, Strasbourg', birthDate: '1998-08-07', joinDate: '2023-06-01', status: 'visiteur', role: 'membre', groups: [] },
  { id: '11', firstName: 'Antoine', lastName: 'Fontaine', email: 'antoine.fontaine@email.com', phone: '0634901234', address: '11 Rue Nationale, Tours', birthDate: '1987-02-14', joinDate: '2019-10-20', status: 'actif', role: 'membre', groups: ['5'] },
  { id: '12', firstName: 'Nathalie', lastName: 'Girard', email: 'nathalie.girard@email.com', phone: '0789234567', address: '4 Place du Marché, Rennes', birthDate: '1993-10-09', joinDate: '2022-07-03', status: 'actif', role: 'membre', groups: ['2', '5'] },
]

export const mockTransactions: Transaction[] = [
  { id: '1', date: '2024-06-01', type: 'recette', category: 'Dîme', description: 'Dîmes du dimanche 1 juin', amount: 2850, paymentMethod: 'especes', memberId: '1' },
  { id: '2', date: '2024-06-01', type: 'recette', category: 'Offrande', description: 'Offrandes du culte dominical', amount: 1200, paymentMethod: 'especes' },
  { id: '3', date: '2024-06-03', type: 'depense', category: 'Location', description: 'Loyer de la salle de culte - juin', amount: 1500, paymentMethod: 'virement' },
  { id: '4', date: '2024-06-05', type: 'recette', category: 'Don spécial', description: 'Don pour le projet de construction', amount: 5000, paymentMethod: 'cheque', memberId: '9' },
  { id: '5', date: '2024-06-08', type: 'recette', category: 'Dîme', description: 'Dîmes du dimanche 8 juin', amount: 3100, paymentMethod: 'especes' },
  { id: '6', date: '2024-06-10', type: 'depense', category: 'Fournitures', description: 'Matériel de bureau et d\'impression', amount: 245, paymentMethod: 'especes' },
  { id: '7', date: '2024-06-12', type: 'depense', category: 'Entretien', description: 'Nettoyage et maintenance de la salle', amount: 380, paymentMethod: 'virement' },
  { id: '8', date: '2024-06-15', type: 'recette', category: 'Dîme', description: 'Dîmes du dimanche 15 juin', amount: 2950, paymentMethod: 'especes' },
  { id: '9', date: '2024-06-15', type: 'recette', category: 'Offrande', description: 'Collecte spéciale mission', amount: 1850, paymentMethod: 'especes' },
  { id: '10', date: '2024-06-18', type: 'depense', category: 'Ministère', description: 'Transport pour activité jeunesse', amount: 120, paymentMethod: 'especes' },
  { id: '11', date: '2024-06-20', type: 'recette', category: 'Don en ligne', description: 'Dons via application mobile', amount: 650, paymentMethod: 'mobile' },
  { id: '12', date: '2024-06-22', type: 'recette', category: 'Dîme', description: 'Dîmes du dimanche 22 juin', amount: 3200, paymentMethod: 'especes' },
  { id: '13', date: '2024-06-25', type: 'depense', category: 'Salaires', description: 'Honoraires du pasteur - juin', amount: 2200, paymentMethod: 'virement' },
  { id: '14', date: '2024-06-28', type: 'depense', category: 'Évangélisation', description: 'Impression de flyers pour campagne', amount: 180, paymentMethod: 'especes' },
  { id: '15', date: '2024-06-29', type: 'recette', category: 'Dîme', description: 'Dîmes du dimanche 29 juin', amount: 2750, paymentMethod: 'especes' },
  { id: '16', date: '2024-05-01', type: 'recette', category: 'Dîme', description: 'Dîmes - mai', amount: 11200, paymentMethod: 'especes' },
  { id: '17', date: '2024-05-15', type: 'depense', category: 'Location', description: 'Loyer salle - mai', amount: 1500, paymentMethod: 'virement' },
  { id: '18', date: '2024-04-01', type: 'recette', category: 'Dîme', description: 'Dîmes - avril', amount: 10800, paymentMethod: 'especes' },
  { id: '19', date: '2024-04-15', type: 'depense', category: 'Location', description: 'Loyer salle - avril', amount: 1500, paymentMethod: 'virement' },
  { id: '20', date: '2024-03-01', type: 'recette', category: 'Dîme', description: 'Dîmes - mars', amount: 9500, paymentMethod: 'especes' },
]

export const mockEvents: ChurchEvent[] = [
  { id: '1', title: 'Culte du Dimanche Matin', description: 'Service hebdomadaire de louange et d\'adoration avec prédication', date: '2024-06-30', time: '10:00', location: 'Salle principale', type: 'culte', status: 'planifie', organizer: '3', maxAttendees: 200, attendees: ['1','2','3','4','5','6','7','9','11','12'], recurring: true, recurringPattern: 'Chaque dimanche' },
  { id: '2', title: 'Réunion de Prière du Mercredi', description: 'Soirée de prière intercession', date: '2024-07-03', time: '19:00', location: 'Salle de prière', type: 'reunion', status: 'planifie', organizer: '5', attendees: ['1','3','5','9'], recurring: true, recurringPattern: 'Chaque mercredi' },
  { id: '3', title: 'Conférence de l\'Église', description: 'Conférence annuelle thème : "Marcher dans la Foi"', date: '2024-07-12', time: '09:00', endDate: '2024-07-14', location: 'Centre de conférence', type: 'conference', status: 'planifie', organizer: '3', maxAttendees: 500, attendees: ['1','2','3','4','5','6','7','8','9','10','11','12'] },
  { id: '4', title: 'Formation des Leaders', description: 'Session de formation pour les responsables de groupes', date: '2024-07-06', time: '14:00', location: 'Salle de formation', type: 'formation', status: 'planifie', organizer: '2', maxAttendees: 30, attendees: ['1','2','3','5','9'] },
  { id: '5', title: 'Pique-nique Communautaire', description: 'Journée de convivialité en famille', date: '2024-07-20', time: '11:00', location: 'Parc Municipal', type: 'social', status: 'planifie', organizer: '4', attendees: ['1','2','4','6','7','11','12'] },
  { id: '6', title: 'Évangélisation Place du Marché', description: 'Sortie évangélisation en équipe', date: '2024-06-22', time: '14:00', location: 'Place centrale', type: 'autre', status: 'termine', organizer: '9', attendees: ['3','5','7','9','11'] },
  { id: '7', title: 'Rentrée des Groupes de Cellule', description: 'Réunion de lancement de la saison pour tous les groupes', date: '2024-09-08', time: '18:00', location: 'Salle principale', type: 'reunion', status: 'planifie', organizer: '1', attendees: ['1','2','3','4','5','6'] },
  { id: '8', title: 'Concert de Louange', description: 'Soirée de louange avec la chorale et groupes invités', date: '2024-08-03', time: '18:30', location: 'Salle principale', type: 'culte', status: 'planifie', organizer: '2', maxAttendees: 300, attendees: ['1','2','4','6','12'] },
]

export const mockGroups: Group[] = [
  { id: '1', name: 'Conseil d\'Église', description: 'Organe directeur de l\'église', type: 'service', leader: '3', members: ['1','3','5','9'], meetingDay: 'Lundi', meetingTime: '18:00', meetingLocation: 'Bureau pastoral', active: true },
  { id: '2', name: 'Chorale Hosanna', description: 'Groupe de louange et chant', type: 'chorale', leader: '2', members: ['2','4','6','12'], meetingDay: 'Samedi', meetingTime: '15:00', meetingLocation: 'Salle de musique', active: true },
  { id: '3', name: 'Cellule Quartier Nord', description: 'Groupe de cellule - zone nord de la ville', type: 'cellule', leader: '9', members: ['1','4','9'], meetingDay: 'Jeudi', meetingTime: '19:30', meetingLocation: 'Maison de Jean Dupont', active: true },
  { id: '4', name: 'Groupe des Jeunes', description: 'Ministère jeunesse 15-30 ans', type: 'jeunesse', leader: '5', members: ['5','7','10'], meetingDay: 'Vendredi', meetingTime: '19:00', meetingLocation: 'Salle jeunesse', active: true },
  { id: '5', name: 'Ministère Femmes', description: 'Groupe de soutien et d\'étude pour les femmes', type: 'femmes', leader: '6', members: ['6','7','11','12'], meetingDay: 'Mardi', meetingTime: '10:00', meetingLocation: 'Salle polyvalente', active: true },
]

export const mockAttendance: Attendance[] = [
  { id: '1', eventId: '1', date: '2024-06-23', presentMembers: ['1','2','3','4','5','6','7','9','11','12'], totalPresent: 145, totalMembers: 200, notes: 'Bonne présence malgré la chaleur' },
  { id: '2', eventId: '1', date: '2024-06-16', presentMembers: ['1','2','3','5','9'], totalPresent: 162, totalMembers: 200 },
  { id: '3', eventId: '1', date: '2024-06-09', presentMembers: ['1','2','3','4','5','6','9','12'], totalPresent: 178, totalMembers: 200 },
  { id: '4', eventId: '2', date: '2024-06-26', presentMembers: ['1','3','5'], totalPresent: 28, totalMembers: 40 },
  { id: '5', eventId: '6', date: '2024-06-22', presentMembers: ['3','5','7','9','11'], totalPresent: 5, totalMembers: 5, notes: 'Excellent engagement' },
]
