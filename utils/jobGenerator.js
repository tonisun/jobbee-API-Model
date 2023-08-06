const mongoose = require('mongoose');
const faker = require('faker');
const User = require('../models/User');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/jobbee';  // Ersetzen Sie dies durch Ihre eigene URI

const jobGenerator = async (numberOfDataSets = 10) => {
    let generatedJobs = [];

    try {
        // Verbindung zur MongoDB herstellen
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Alle Benutzer mit der Rolle "Arbeitgeber" abrufen
        const employerUsers = await User.find({ role: 'employer' });

        if (!employerUsers.length) {
            throw new Error('Es gibt keinen Benutzer in der Datenbank mit der Rolle => Arbeitgeber.');
        }

        for (let i = 0; i < numberOfDataSets; i++) {
            const randomEmployer = faker.random.arrayElement(employerUsers);

            const industryOptions = ['Business', 'IT', 'Banking', 'Education', 'Training', 'Telecommunication', 'Others'];
            const jobTypeOptions = ['Permanent', 'Temporary', 'Internship', 'Home office'];
            const minEducationOptions = ['Bachelors', 'Masters', 'Phd'];
            const experienceOptions = ['No Experience', '1 Year - 2 Years', '2 Years - 5 Years', '5 Years +'];

            const job = {
                title: faker.name.jobTitle(),
                slug: faker.helpers.slugify(faker.name.jobTitle()),
                description: faker.lorem.paragraphs(2),
                email: faker.internet.email(),
                address: faker.address.streetAddress(),
                location: {
                    type: 'Point',
                    coordinates: [faker.address.longitude(), faker.address.latitude()],
                    formattedAddress: faker.address.streetAddress(),
                    city: faker.address.city(),
                    state: faker.address.state(),
                    zipcode: faker.address.zipCode(),
                    country: faker.address.country()
                },
                company: faker.company.companyName(),
                industry: faker.random.arrayElements(industryOptions, 1),
                jobType: faker.random.arrayElement(jobTypeOptions),
                minEducation: faker.random.arrayElement(minEducationOptions),
                //positions: faker.random.number({ min: 1, max: 5 }),
                positions: faker.datatype.number({ min: 1, max: 5 }),
                experience: faker.random.arrayElement(experienceOptions),
                //salary: faker.random.number({ min: 50000, max: 150000 }),
                salary: faker.datatype.number({ min: 50000, max: 150000 }),
                postingDate: new Date(),
                lastDate: new Date().setDate(new Date().getDate() + 7),
                applicantsApplied: [],
                user: randomEmployer._id
            }

            generatedJobs.push(job);
        }

    } catch (error) {
        console.error('Ein Fehler ist aufgetreten:', error.message);

    } finally {
        
        mongoose.connection.close();
    }

    return generatedJobs;
}

module.exports = jobGenerator;