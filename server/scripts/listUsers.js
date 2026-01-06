
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const UserSchema = new mongoose.Schema({}, { strict: false });
const AdminSchema = new mongoose.Schema({}, { strict: false });

const User = mongoose.model('User', UserSchema, 'RegisterDataUser');
const Admin = mongoose.model('Admin', AdminSchema, 'RegisterDataAdmin');

const main = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pbl_2025');
        console.log('Connected to MongoDB');

        const users = await User.find({});
        console.log('\n--- USERS ---');
        users.forEach(u => console.log(JSON.stringify({ email: u.email, role: u.role, name: u.fullName })));

        const admins = await Admin.find({});
        console.log('\n--- ADMINS ---');
        admins.forEach(a => console.log(JSON.stringify({ email: a.email, role: a.role, name: a.fullName })));

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

main();
