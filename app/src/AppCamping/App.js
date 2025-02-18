import '../assets/css/style.css';

const CAMPING_URL = 'http://localhost/api/rentals';
const ACCOMODATION_URL = 'http://localhost/api/accommodations';

class App {
    listeEntry = [];
    listeExit = [];
    selectedDate = new Date().toISOString().split('T')[0];

    start() {
        console.log('Application démarrée ...');
        this.renderBaseUI();
        this.renderDays();
        this.initCampings();
    }

    initCampings() {
        fetch(CAMPING_URL)
            .then(response => response.json())
            .then(data => {
                this.listeEntry = data.member;
                this.listeExit = data.member;
                this.renderReservations();
            })
            .catch(error => console.error(error));
    }

    async updateAccommodationAvailability(id, accommodationId, availability) {
        const updateData = { availability };
        try {
            const response = await fetch(`${ACCOMODATION_URL}/${accommodationId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/merge-patch+json" },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP! Statut: ${response.status}`);
            }

            const result = await response.json();
            console.log("Disponibilité mise à jour :", result);
            this.initCampings();

        } catch (error) {
            console.error("Erreur :", error);
        }
    }

    renderBaseUI() {
        if (document.querySelector('header')) return;

        const elHeader = document.createElement('header');
        elHeader.innerHTML = '<h1>Mon application de camping</h1>';

        const elMain = document.createElement('main');

        // Tableau des Arrivées
        const elArrivalsTitle = document.createElement('h2');
        elArrivalsTitle.textContent = 'Liste des Arrivées';
        const elArrivalsTable = document.createElement('table');
        elArrivalsTable.innerHTML = `
            <thead>
                <tr>
                    <th>Date d'arrivée</th>
                    <th>Date de départ</th>
                    <th>Nom</th>
                    <th>Type d'hébergement</th>
                    <th>Emplacement</th>
                    <th>Disponibilité</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id='liste-arrivals'></tbody>
        `;
        elMain.appendChild(elArrivalsTitle);
        elMain.appendChild(elArrivalsTable);

        // Tableau des Départs
        const elDeparturesTitle = document.createElement('h2');
        elDeparturesTitle.textContent = 'Liste des Départs';
        const elDeparturesTable = document.createElement('table');
        elDeparturesTable.innerHTML = `
            <thead>
                <tr>
                    <th>Date de départ</th>
                    <th>Date d'arrivée</th>
                    <th>Nom</th>
                    <th>Type d'hébergement</th>
                    <th>Emplacement</th>
                    <th>Disponibilité</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id='liste-departures'></tbody>
        `;
        elMain.appendChild(elDeparturesTitle);
        elMain.appendChild(elDeparturesTable);

        document.body.appendChild(elHeader);
        document.body.appendChild(elMain);
    }

    renderReservations() {
        this.renderArrivals();
        this.renderDepartures();
    }

    renderArrivals() {
        const elTbodyArrivals = document.getElementById('liste-arrivals');
        elTbodyArrivals.innerHTML = '';

        const filteredArrivals = this.listeEntry.filter(rental =>
            rental.date_start.split('T')[0] === this.selectedDate
        );

        filteredArrivals.forEach(rental => {
            const tr = document.createElement('tr');
            tr.dataset.id = rental.id;
            tr.dataset.ida = rental.accommodation.id;
            const isAvailable = rental.accommodation && rental.accommodation.availability;
            tr.innerHTML = `
                <td>${rental.date_start.split('T')[0]}</td>
                <td>${rental.date_end.split('T')[0]}</td>
                <td>${rental.user ? rental.user.firstname : ''} ${rental.user ? rental.user.lastname : ''}</td>
                <td>${rental.accommodation ? rental.accommodation.type.label : ''}</td>
                <td>${rental.accommodation ? rental.accommodation.location_number : ''}</td>
                <td>
                    <select style="color: ${isAvailable ? 'green' : 'red'};">
                        <option value="available" style="color: green;" ${isAvailable ? 'selected' : ''}>Yes</option>
                        <option value="unavailable" style="color: red;" ${!isAvailable ? 'selected' : ''}>No</option>
                    </select>
                </td>
                <td><button>Mettre à jour</button></td>
            `;
            tr.querySelector('button').addEventListener('click', (event) => this.handlerUpdate(event));
            elTbodyArrivals.appendChild(tr);
        });
    }

    renderDepartures() {
        const elTbodyDepartures = document.getElementById('liste-departures');
        elTbodyDepartures.innerHTML = '';

        const filteredDepartures = this.listeExit.filter(rental =>
            rental.date_end.split('T')[0] === this.selectedDate
        );

        filteredDepartures.forEach(rental => {
            const tr = document.createElement('tr');
            tr.dataset.id = rental.id;
            tr.dataset.ida = rental.accommodation.id;
            const isAvailable = rental.accommodation && rental.accommodation.availability;

            tr.innerHTML = `
                <td>${rental.date_end.split('T')[0]}</td>
                <td>${rental.date_start.split('T')[0]}</td>
                <td>${rental.user ? rental.user.firstname : ''} ${rental.user ? rental.user.lastname : ''}</td>
                <td>${rental.accommodation ? rental.accommodation.type.label : ''}</td>
                <td>${rental.accommodation ? rental.accommodation.location_number : ''}</td>
                <td>
                    <select style="color: ${isAvailable ? 'green' : 'red'};">
                        <option value="available" style="color: green;" ${isAvailable ? 'selected' : ''}>Yes</option>
                        <option value="unavailable" style="color: red;" ${!isAvailable ? 'selected' : ''}>No</option>
                    </select>
                </td>
                <td><button>Mettre à jour</button></td>
            `;
            tr.querySelector('button').addEventListener('click', (event) => this.handlerUpdate(event));
            elTbodyDepartures.appendChild(tr);
        });
    }


    handlerUpdate(event) {
        const button = event.target;
        const tr = button.closest('tr');
        const select = tr.querySelector('select');
        const availability = select.value === 'available';
        const id = parseInt(tr.dataset.id, 10);
        const accommodationId = parseInt(tr.dataset.ida, 10);
        this.updateAccommodationAvailability(id, accommodationId, availability);
    }

    renderDays() {
        if (document.getElementById('days-container')) return;

        const elDaysContainer = document.createElement('div');
        elDaysContainer.id = 'days-container';
        document.body.appendChild(elDaysContainer);

        const elCalendarInput = document.createElement('input');
        elCalendarInput.type = 'date';
        elCalendarInput.value = this.selectedDate;
        elCalendarInput.addEventListener('change', (event) => {
            this.selectedDate = event.target.value;
            this.renderReservations(); // Directly render reservations after date change
        });
        elDaysContainer.appendChild(elCalendarInput);
    }
}

const app = new App();
app.start();

export default app;
