require("dotenv").config();
const bcrypt = require("bcrypt");

const saltRounds = 10;
const plainPassword = process.env.PLAIN_PASSWORD; // AMBIL DARI ENV

if (!plainPassword) {
    console.error("ENV PLAIN_PASSWORD belum di-set!");
    process.exit(1);
}

bcrypt.hash(plainPassword, saltRounds, function(err, hash) {
    if (err) {
        console.error("Error hashing password:", err);
        return;
    }
    console.log("Password Anda (plain):", plainPassword);
    console.log("Hasil Hash (simpan ini di database):");
    console.log(hash);
});
