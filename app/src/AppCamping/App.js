// Import de la feuille de style
import '../assets/css/style.css';

const CAMPING_URL = 'http://localhost/api/rentals';

const ACCOMODATION_URL = 'http://localhost/api/accommodations';

class App {

    // Liste des réservations d'entrée (données fictives)
    listeEntry = [];

    // Liste des réservations de sortie (données fictives)
    listeExit = [];

    /**
     * Démarre l'application
     */
    start() {
        console.log('Application démarrée ...');
        // Rendu de l'Interface Utilisateur
        this.renderBaseUI();
        // Rendu des réservations
        this.renderReservations();
        this.initCampings();
    }

    initCampings() {
        fetch(CAMPING_URL)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                // Séparer les données en arrivées et départs
                this.listeEntry = data.member;
                this.listeExit = data.member;
                this.renderReservations();
            })
            .catch(error => console.error(error));
    }

    /**
     * Méthode pour mettre à jour la disponibilité d'une accommodation
     * @param {int} id
     * @param {int} accommodationId
     * @param {boolean} availability
     */
    async updateAccommodationAvailability(id, accommodationId, availability) {
        const updateData = { availability };
        console.log("Mise à jour de la disponibilité de l'hébergement :", accommodationId, updateData);
        try {
            const response = await fetch(`${ACCOMODATION_URL}/${accommodationId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/merge-patch+json",
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP! Statut: ${response.status}`);
            }

            const result = await response.json();
            console.log("Disponibilité de l'hébergement mise à jour :", result);

            // Mettre à jour les listes locales
            this.listeEntry = this.listeEntry.map(rental =>
                rental.id === id ? { ...rental, accommodation: { ...rental.accommodation, availability } } : rental
            );
            this.listeExit = this.listeExit.map(rental =>
                rental.id === id ? { ...rental, accommodation: { ...rental.accommodation, availability } } : rental
            );

            // Rafraîchir les réservations affichées
            this.renderReservations();
        } catch (error) {
            console.error("Erreur lors de la mise à jour de la disponibilité :", error);
        }
    }

    /**
     * Rendu de l'interface utilisateur
     */
    renderBaseUI() {
        // Vérifier si l'élément principal existe déjà, pour éviter la duplication
        if (document.querySelector('header')) return;

        // -- <header>
        const elHeader = document.createElement('header');
        elHeader.innerHTML = '<h1>Mon application de camping</h1>';

        // -- <main>
        const elMain = document.createElement('main');
        elMain.innerHTML = '<h2>Liste des arrivées</h2>';

        // -- <table> pour les arrivées
        const elTableEntry = document.createElement('table');
        const elTheadEntry = document.createElement('thead');
        elTheadEntry.innerHTML = `
            <tr>
                <th>Date d'arrivée</th>
                <th>Date de départ</th>
                <th>Nom</th>
                <th>Type d'hébergement</th>
                <th>Emplacement</th>
                <th>Disponibilité</th>
                <th>Actions</th>
            </tr>
        `;
        const elTbodyEntry = document.createElement('tbody');
        elTbodyEntry.id = 'liste-entry';

        // -- <h2> Liste des départs
        const elTitleExit = document.createElement('h2');
        elTitleExit.textContent = 'Liste des départs';

        // -- <table> pour les départs
        const elTableExit = document.createElement('table');
        const elTheadExit = document.createElement('thead');
        elTheadExit.innerHTML = `
            <tr>
                <th>Date de départ</th>
                <th>Date d'arrivée</th>
                <th>Nom</th>
                <th>Type d'hébergement</th>
                <th>Emplacement</th>
                <th>Disponibilité</th>
                <th>Actions</th>
            </tr>
        `;
        const elTbodyExit = document.createElement('tbody');
        elTbodyExit.id = 'liste-exit';

        // -- Assemblage des tableaux
        elTableEntry.appendChild(elTheadEntry);
        elTableEntry.appendChild(elTbodyEntry);

        elTableExit.appendChild(elTheadExit);
        elTableExit.appendChild(elTbodyExit);

        elMain.appendChild(elTableEntry);
        elMain.appendChild(elTitleExit);  // Ajout du titre des départs
        elMain.appendChild(elTableExit);  // Ajout du tableau des départs

        // -- Assemblage final de la page
        document.body.appendChild(elHeader);
        document.body.appendChild(elMain);
    }

    /**
     * Rendu des réservations dans les tableaux
     */
    renderReservations() {
        const elTbodyEntry = document.getElementById('liste-entry');
        const elTbodyExit = document.getElementById('liste-exit');

        // Vider les anciens éléments des tableaux avant d'ajouter de nouvelles lignes
        elTbodyEntry.innerHTML = '';
        elTbodyExit.innerHTML = '';

        // Rendu des réservations d'entrée
        this.listeEntry.forEach(rental => {
            const tr = document.createElement('tr');
            tr.dataset.id = rental.id;
            tr.dataset.ida = rental.accommodation.id;
            tr.innerHTML = `
                <td>${new Date(rental.date_start).toISOString().split('T')[0]}</td>
                <td>${new Date(rental.date_end).toISOString().split('T')[0]}</td>
                <td>${rental.user ? rental.user.firstname : ''} ${rental.user ? rental.user.lastname : ''}</td>
                <td>${rental.accommodation ? rental.accommodation.type.label : ''}</td>
                <td>${rental.accommodation ? rental.accommodation.location_number : ''}</td>
                <td>
                    <select>
                        <option value="available" ${rental.accommodation && rental.accommodation.availability ? 'selected' : ''}>Yes</option>
                        <option value="unavailable" ${rental.accommodation && !rental.accommodation.availability ? 'selected' : ''}>No</option>
                    </select>
                </td>
                <td><button>Mettre à jour</button></td>
            `;
            const updateButton = tr.querySelector('button');
            updateButton.addEventListener('click', (event) => this.handlerUpdate(event));
            elTbodyEntry.appendChild(tr);
        });

        // Rendu des réservations de sortie
        this.listeExit.forEach(rental => {
            const tr = document.createElement('tr');
            tr.dataset.id = rental.id;
            tr.dataset.ida = rental.accommodation.id;
            tr.innerHTML = `
                <td>${new Date(rental.date_end).toISOString().split('T')[0]}</td>
                <td>${new Date(rental.date_start).toISOString().split('T')[0]}</td>
                <td>${rental.user ? rental.user.firstname : ''} ${rental.user ? rental.user.lastname : ''}</td>
                <td>${rental.accommodation ? rental.accommodation.type.label : ''}</td>
                <td>${rental.accommodation ? rental.accommodation.location_number : ''}</td>
                <td>
                    <select>
                        <option value="available" ${rental.accommodation && rental.accommodation.availability ? 'selected' : ''}>Yes</option>
                        <option value="unavailable" ${rental.accommodation && !rental.accommodation.availability ? 'selected' : ''}>No</option>
                    </select>
                </td>
                <td><button>Mettre à jour</button></td>
            `;
            const updateButton = tr.querySelector('button');
            updateButton.addEventListener('click', (event) => this.handlerUpdate(event));
            elTbodyExit.appendChild(tr);
        });
    }
    /**
     * Gestionnaire de l'événement 'Mettre à jour'
     * @param {Event} event 
     */
    handlerUpdate(event) {
        const button = event.target;
        const tr = button.closest('tr');
        const select = tr.querySelector('select');
        const availability = select.value === 'available';
        const id = parseInt(tr.dataset.id, 10);
        const accommodationId = parseInt(tr.dataset.ida, 10);

        this.updateAccommodationAvailability(id, accommodationId, availability);
    }
}

// Lancer l'application
const app = new App();
app.start();

// Exporter l'application
export default app;
