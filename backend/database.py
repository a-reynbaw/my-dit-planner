import sqlite3
from contextlib import contextmanager
import os

DATABASE_PATH = "courses.db"

def init_database():
    """Initialize the SQLite database with the courses and requirements tables"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    # Courses table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            code TEXT,
            ects INTEGER,
            semester INTEGER,
            status TEXT,
            type TEXT,
            direction TEXT,
            S1 TEXT,
            S2 TEXT,
            S3 TEXT,
            S4 TEXT,
            S5 TEXT,
            S6 TEXT
        )
    ''')

    courses = [
        # semester 1
        ('Γραμμική Άλγεβρα', 'Κ03', 6, 1, 'Not Taken', 'ΥΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Διακριτά Μαθηματικά', 'Κ09', 7, 1, 'Not Taken', 'ΥΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Εισαγωγή στην Πληροφορική και στις Τηλεπικοινωνίες', 'ΓΠ07', 2, 1, 'Not Taken', 'ΓΠ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Εισαγωγή στον Προγραμματισμό', 'Κ04', 7, 1, 'Not Taken', 'ΥΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Εργαστήριο Λογικής Σχεδίασης', 'K02ε', 2, 1, 'Not Taken', 'ΕΡ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Λογική Σχεδίαση', 'Κ02', 6, 1, 'Not Taken', 'ΥΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),

        # semester 2
        ('Ανάλυση Ι', 'Κ01', 8, 2, 'Not Taken', 'ΥΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Αρχιτεκτονική Υπολογιστών Ι', 'Κ14', 7, 2, 'Not Taken', 'ΥΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Δομές Δεδομένων και Τεχνικές Προγραμματισμού', 'Κ08', 7, 2, 'Not Taken', 'ΥΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Εφαρμοσμένα Μαθηματικά', 'Κ20β', 6, 2, 'Not Taken', 'ΠΜ', 'CET', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'B'),
        ('Ηλεκτρομαγνητισμός – Οπτική και Σύγχρονη Φυσική', 'Κ12', 8, 2, 'Not Taken', 'ΥΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),

        # semester 3
        ('Ανάλυση ΙΙ', 'Κ06', 8, 3, 'Not Taken', 'ΥΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Αντικειμενοστραφής Προγραμματισμός', 'Κ10', 8, 3, 'Not Taken', 'ΥΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Εργαστήριο Κυκλωμάτων και Συστημάτων', 'Κ11ε', 2, 3, 'Not Taken', 'ΕΡ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Πιθανότητες και Στατιστική', 'Κ13', 6, 3, 'Not Taken', 'ΥΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Σήματα και Συστήματα', 'Κ11', 6, 3, 'Not Taken', 'ΥΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),

        # semester 4
        ('Αλγόριθμοι και Πολυπλοκότητα', 'Κ17', 8, 4, 'Not Taken', 'ΥΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Δίκτυα Επικοινωνιών I', 'Κ16', 6, 4, 'Not Taken', 'ΥΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Εργαστήριο Δικτύων Επικοινωνιών Ι', 'Κ16ε', 2, 4, 'Not Taken', 'ΕΡ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Συστήματα Επικοινωνιών', 'Κ21', 7, 4, 'Not Taken', 'ΥΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Σχεδίαση και Χρήση Βάσεων Δεδομένων', 'Κ29', 7, 4, 'Not Taken', 'ΥΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),

        # semester 5
        ('Αριθμητική Ανάλυση', 'Κ15', 6, 5, 'Not Taken', 'ΕΥΜ', 'COM', 'Υ', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Αρχές Γλωσσών Προγραμματισμού', 'ΘΠ01', 6, 5, 'Not Taken', 'ΠΜ', 'CS', 'B', 'B', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Αρχιτεκτονική Υπολογιστών ΙΙ', 'Κ30', 6, 5, 'Not Taken', 'ΕΥΜ', 'CS', 'NULL', 'NULL', 'B', 'Υ', 'NULL', 'NULL'),
        ('Γραφικά Ι', 'ΘΠ02', 6, 5, 'Not Taken', 'ΠΜ', 'COM', 'B', 'NULL', 'NULL', 'NULL', 'NULL', 'B'),
        ('Δίκτυα Επικοινωνιών II', 'Κ33', 6, 5, 'Not Taken', 'ΕΥΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'Υ', 'NULL'),
        ('Εργαστήριο Δικτύων Επικοινωνιών Ι', 'Κ16ε', 2, 5, 'Not Taken', 'ΕΡ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Κύματα, Κυματοδηγοί, Κεραίες', 'ΕΠ05', 6, 5, 'Not Taken', 'ΠΜ', 'CET', 'NULL', 'NULL', 'NULL', 'NULL', 'B', 'NULL'),
        ('Λειτουργικά Συστήματα', 'Κ22', 8, 5, 'Not Taken', 'ΥΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Παράλληλα Συστήματα', 'ΘΠ04', 6, 5, 'Not Taken', 'ΠΜ', 'COM', 'NULL', 'NULL', 'B', 'B', 'NULL', 'NULL'),
        ('Σχεδίαση Ψηφιακών Συστημάτων - VHDL', 'ΥΣ03', 6, 5, 'Not Taken', 'ΠΜ', 'CET', 'NULL', 'NULL', 'NULL', 'B', 'NULL', 'NULL'),
        ('Τεχνητή Νοημοσύνη I', 'ΥΣ02', 6, 5, 'Not Taken', 'ΠΜ', 'CS', 'NULL', 'B', 'B', 'NULL', 'NULL', 'NULL'),
        ('Τηλεπικοινωνιακά Δίκτυα', 'ΕΠ20', 6, 5, 'Not Taken', 'ΠΜ', 'CET', 'NULL', 'NULL', 'NULL', 'NULL', 'B', 'NULL'),
        ('Υλοποίηση Συστημάτων Βάσεων Δεδομένων', 'Κ18', 6, 5, 'Not Taken', 'ΕΥΜ', 'COM', 'NULL', 'Υ', 'Υ', 'NULL', 'NULL', 'NULL'),
        ('Ψηφιακή Επεξεργασία Σήματος', 'Κ32', 6, 5, 'Not Taken', 'ΕΥΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'Υ'),

        # semester 6
        ('Αλγόριθμοι-Θεμελιώσεις Μηχανικής Μάθησης', 'ΘΠ16β', 6, 6, 'Not Taken', 'ΠΜ', 'CS', 'B', 'B', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Αναγνώριση Προτύπων–Μηχανική Μάθηση', 'ΕΠ08', 6, 6, 'Not Taken', 'ΠΜ', 'COM', 'B', 'B', 'NULL', 'NULL', 'NULL', 'B'),
        ('Ανάλυση/Σχεδίαση Συστημάτων Λογισμικού', 'ΥΣ04', 6, 6, 'Not Taken', 'ΠΜ', 'CS', 'NULL', 'NULL', 'B', 'NULL', 'NULL', 'NULL'),
        ('Ασύρματα Δίκτυα Αισθητήρων', 'ΥΣ18', 6, 6, 'Not Taken', 'ΠΜ', 'CET', 'NULL', 'NULL', 'NULL', 'B', 'B', 'NULL'),
        ('Διαχείριση Δικτύων', 'Κ34', 6, 6, 'Not Taken', 'ΕΥΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'Υ', 'NULL'),
        ('Ειδικά Θέματα Επικοινωνιών και Επεξεργασίας Σήματος – Πολυμέσα και Ασύρματη Δικτύωση', 'ΕΠ22β', 4, 6, 'Not Taken', 'ΠΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Επεξεργασία Στοχαστικών Σημάτων', 'ΕΠ07', 6, 6, 'Not Taken', 'ΠΜ', 'CET', 'NULL', 'NULL', 'NULL', 'NULL', 'B', 'B'),
        ('Επιστημονικοί Υπολογισμοί', 'ΘΠ03', 6, 6, 'Not Taken', 'ΠΜ', 'CS', 'B', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Εργαστήριο Ηλεκτρονικής', 'Κ19ε', 6, 6, 'Not Taken', 'ΠΜ', 'CET', 'NULL', 'NULL', 'NULL', 'B', 'NULL', 'NULL'),
        ('Ηλεκτρονική', 'K19', 6, 6, 'Not Taken', 'ΕΥΜ', 'COM', 'NULL', 'NULL', 'NULL', 'Υ', 'NULL', 'NULL'),
        ('Θεωρία Πληροφορίας και Κωδίκων', 'Κ35', 6, 6, 'Not Taken', 'ΕΥΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'Υ'),
        ('Θεωρία Υπολογισμού', 'Κ25', 6, 6, 'Not Taken', 'ΕΥΜ', 'COM', 'NULL', 'Υ', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Λογικός Προγραμματισμός', 'ΥΣ05', 6, 6, 'Not Taken', 'ΠΜ', 'CS', 'NULL', 'B', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Μαθηματικά Πληροφορικής', 'Κ20α', 6, 6, 'Not Taken', 'ΕΥΜ', 'COM', 'Υ', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Μεταγλωττιστές', 'Κ31', 6, 6, 'Not Taken', 'ΕΥΜ', 'CET', 'NULL', 'NULL', 'Υ', 'B', 'NULL', 'NULL'),
        ('Προγραμματισμός Συστήματος', 'Κ24', 8, 6, 'Not Taken', 'ΥΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Τεχνητή Νοημοσύνη ΙΙ (Βαθιά Μηχανική Μάθηση για την Επεξεργασία Φυσικής Γλώσσας)', 'ΥΣ19', 6, 6, 'Not Taken', 'ΠΜ', 'CS', 'NULL', 'B', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Τεχνικές Εξόρυξης Δεδομένων', 'ΥΣ11', 6, 6, 'Not Taken', 'ΠΜ', 'CS', 'NULL', 'B', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Τεχνολογίες Εφαρμογών Διαδικτύου', 'ΥΣ14', 6, 6, 'Not Taken', 'ΠΜ', 'COM', 'NULL', 'NULL', 'B', 'NULL', 'B', 'NULL'),

        # semester 7
        ('Αλγοριθμική Επιχειρησιακή Έρευνα', 'ΘΠ09', 6, 7, 'Not Taken', 'ΠΜ', 'COM', 'B', 'B', 'NULL', 'NULL', 'NULL', 'B'),
        ('Ανάπτυξη Λογισμικού για Αλγοριθμικά Προβλήματα', 'Κ23γ', 8, 7, 'Not Taken', '', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Ανάπτυξη Λογισμικού για Πληροφοριακά Συστήματα', 'Κ23α', 8, 7, 'Not Taken', '', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Ανάπτυξη Λογισμικού για Συστήματα Δικτύων και Τηλεπικοινωνιών', 'Κ23β', 8, 7, 'Not Taken', '', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Διδακτική της Πληροφορικής', 'ΥΣ10', 6, 7, 'Not Taken', 'ΠΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Δομή και Θεσμοί της Ευρωπαϊκής Ένωσης', 'ΓΠ03', 2, 7, 'Not Taken', 'ΓΠ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Ειδικά Θέματα Επικοινωνιών και Επεξεργασίας Σήματος: Ειδικά Θέματα Κβαντικής Πληροφορίας και Υπολογιστικής', 'ΕΠ22δ', 4, 7, 'Not Taken', 'ΠΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Ειδικά Θέματα Υπολογιστικών Συστημάτων και Εφαρμογών', 'ΥΣ16', 4, 7, 'Not Taken', 'ΠΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Ειδικά Θέματα Υπολογιστικών Συστημάτων και Εφαρμογών – Τεχνολογίες Γνώσεων', 'ΥΣ16β', 4, 7, 'Not Taken', 'ΠΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Ενισχυτική Μηχανική Μάθηση και Στοχαστικά Παίγνια', 'ΕΠ22α', 6, 7, 'Not Taken', 'ΠΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Επικοινωνία Ανθρώπου Μηχανής', 'ΥΣ08', 6, 7, 'Not Taken', 'ΠΜ', 'CS', 'NULL', 'B', 'B', 'NULL', 'NULL', 'NULL'),
        ('Ηλεκτρονική Διακυβέρνηση', 'ΥΣ17', 4, 7, 'Not Taken', 'ΠΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Θεωρία Αριθμών', 'ΘΠ08', 6, 7, 'Not Taken', 'ΠΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Οπτικές Επικοινωνίες και Οπτικά Δίκτυα', 'ΕΠ16', 6, 7, 'Not Taken', 'ΠΜ', 'CET', 'NULL', 'NULL', 'NULL', 'B', 'B', 'NULL'),
        ('Πληροφοριακά Συστήματα', 'ΥΣ07', 6, 7, 'Not Taken', 'ΠΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Προηγμένα Θέματα Αλγορίθμων', 'ΘΠ12', 6, 7, 'Not Taken', 'ΠΜ', 'CS', 'B', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Προηγμένοι Επιστημονικοί Υπολογισμοί', 'ΘΠ18', 6, 7, 'Not Taken', 'ΠΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Συστήματα Κινητών και Προσωπικών Επικοινωνιών', 'ΕΠ18', 6, 7, 'Not Taken', 'ΠΜ', 'CET', 'NULL', 'NULL', 'NULL', 'NULL', 'B', 'NULL'),
        ('Συστήματα Ψηφιακής Επεξεργασίας Σημάτων σε Πραγματικό Χρόνο', 'ΕΠ11', 6, 7, 'Not Taken', 'ΠΜ', 'CET', 'NULL', 'NULL', 'NULL', 'B', 'NULL', 'B'),
        ('Σχεδίαση VLSI Κυκλωμάτων', 'ΕΠ01', 6, 7, 'Not Taken', 'ΠΜ', 'CET', 'NULL', 'NULL', 'NULL', 'B', 'NULL', 'NULL'),
        ('Τεχνολογίες της Πληροφορίας και των Επικοινωνιών (ΤΠΕ) στη Μάθηση', 'ΥΣ15', 6, 7, 'Not Taken', 'ΠΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Υπολογιστική Πολυπλοκότητα', 'ΘΠ20', 6, 7, 'Not Taken', 'ΠΜ', 'CS', 'B', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Ψηφιακή Προσβασιμότητα και Υποστηρικτικές Τεχνολογίες Πληροφορικής', 'ΥΣ22', 6, 7, 'Not Taken', 'ΠΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),

        # semester 8
        ('Αλγοριθμική Επίλυση Προβλημάτων', 'ΘΠ24', 6, 8, 'Not Taken', 'ΠΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Ανάλυση Εικόνας και Τεχνητή Όραση', 'ΕΠ23', 6, 8, 'Not Taken', 'ΠΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Ανάπτυξη Υλικού-Λογισμικού για Ενσωματωμένα Συστήματα', 'Κ23δ', 8, 8, 'Not Taken', '', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Ασύρματες Zεύξεις', 'ΕΠ13', 6, 8, 'Not Taken', 'ΠΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Διοίκηση Έργων και Τεχνικές Παρουσίασης και Συγγραφής Επιστημονικών Εκθέσεων', 'ΓΠ05', 2, 8, 'Not Taken', 'ΓΠ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Ειδικά Θέματα Επικοινωνιών και Επεξεργασίας Σήματος: Γραμμές μεταφοράς, κυματοδηγοί και οπτικές ίνες', 'ΕΠ22γ', 4, 8, 'Not Taken', 'ΠΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Ειδικά Θέματα Επικοινωνιών και Επεξεργασίας Σήματος: Ειδικά Θέματα Κβαντικής Μηχανικής Μάθησης', 'ΕΠ22ε', 4, 8, 'Not Taken', 'ΠΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Ειδικά Θέματα Θεωρητικής Πληροφορικής: Αλγόριθμοι Δομικής Βιοπληροφορικής', 'ΘΠ16δ', 6, 8, 'Not Taken', 'ΠΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Ειδικά Θέματα Υπολογιστικών Συστημάτων και Εφαρμογών', 'ΥΣ16', 4, 8, 'Not Taken', 'ΠΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Ειδικά Θέματα Υπολογιστικών Συστημάτων και Εφαρμογών: Υπολογιστικά Συστήματα Μεγάλης Κλίμακας', 'ΥΣ16α', 4, 8, 'Not Taken', 'ΠΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Επεξεργασία Εικόνας', 'ΕΠ10', 6, 8, 'Not Taken', 'ΠΜ', 'CET', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'B'),
        ('Επεξεργασία Ομιλίας και Φυσικής Γλώσσας', 'ΕΠ19', 6, 8, 'Not Taken', 'ΠΜ', 'CET', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'B'),
        ('Θεωρία Γραφημάτων', 'ΘΠ10', 6, 8, 'Not Taken', 'ΠΜ', 'CS', 'B', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Ιστορία της Πληροφορικής και των Τηλεπικοινωνιών', 'ΥΣ20', 4, 8, 'Not Taken', 'ΠΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Καινοτομία και Επιχειρηματικότητα', 'ΥΣ12', 4, 8, 'Not Taken', 'ΠΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Κρυπτογραφία', 'ΘΠ05', 6, 8, 'Not Taken', 'ΠΜ', 'CS', 'B', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Μικροοικονομική Ανάλυση', 'ΕΠ24', 4, 8, 'Not Taken', 'ΠΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Μουσική Πληροφορική', 'ΕΠ21', 4, 8, 'Not Taken', 'ΠΜ', 'CET', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'B'),
        ('Παράλληλοι Αλγόριθμοι', 'ΘΠ19', 6, 8, 'Not Taken', 'ΠΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Προστασία και Ασφάλεια Υπολογιστικών Συστημάτων', 'ΥΣ13', 6, 8, 'Not Taken', 'ΠΜ', 'CS', 'NULL', 'NULL', 'B', 'NULL', 'NULL', 'NULL'),
        ('Σημασιολογία Γλωσσών Προγραμματισμού', 'ΘΠ16α', 6, 8, 'Not Taken', 'ΠΜ', 'CS', 'B', 'B', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Σχολική Τάξη & Μικροδιδασκαλία', 'ΥΣ21', 6, 8, 'Not Taken', 'ΠΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Τεχνολογία Λογισμικού', 'ΥΣ09', 6, 8, 'Not Taken', 'ΠΜ', 'CS', 'NULL', 'NULL', 'B', 'NULL', 'NULL', 'NULL'),
        ('Υπολογιστική Γεωμετρία', 'ΘΠ11', 6, 8, 'Not Taken', 'ΠΜ', 'CS', 'B', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Υπολογιστική Θεωρία Μηχανικής Μάθησης', 'ΘΠ23', 6, 8, 'Not Taken', 'ΠΜ', 'CS', 'B', 'B', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Φωτονική', 'ΕΠ12', 6, 8, 'Not Taken', 'ΠΜ', 'COM', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'),
        ('Ψηφιακές Επικοινωνίες', 'ΕΠ04', 6, 8, 'Not Taken', 'ΠΜ', 'CET', 'NULL', 'NULL', 'NULL', 'NULL', 'B', 'NULL')
    ]
    for name, code, ects, semester, status, type_, direction, S1, S2, S3, S4, S5, S6 in courses:
        cursor.execute(
            '''INSERT OR IGNORE INTO courses (name, code, ects, semester, status, type, direction, S1, S2, S3, S4, S5, S6)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (name, code, ects, semester, status, type_, direction, S1, S2, S3, S4, S5, S6)
        )
    # Degree requirements table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS degree_requirements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT,
            description TEXT,
            min_courses INTEGER,
            min_ects INTEGER
        )
    ''')
    # Insert requirements if not present
    requirements = [
        ("Υποχρεωτικά", "Compulsory courses", 18, 128),
        ("Επιλογής Υποχρεωτικά Κατεύθυνσης", "Elective compulsory direction", 4, 24),
        ("Project Κατεύθυνσης", "Direction project", 1, 8),
        ("Προαιρετικά Βασικά", "Optional basic", 4, 24),
        ("Γενικής Παιδείας", "General education", 3, 6),
        ("Πτυχιακή/Πρακτική", "Thesis I & II or Internship I & II or combination", 2, 16),
        ("Ελεύθερης Επιλογής", "Free electives/other", None, 34),
    ]
    for cat, desc, min_courses, min_ects in requirements:
        cursor.execute(
            '''INSERT OR IGNORE INTO degree_requirements (category, description, min_courses, min_ects)
               VALUES (?, ?, ?, ?)''',
            (cat, desc, min_courses, min_ects)
        )
    conn.commit()
    conn.close()

@contextmanager
def get_db_connection():
    """Context manager for database connections"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def get_all_courses():
    """Return all courses as a list of dicts"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM courses ORDER BY semester, id')
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def get_degree_requirements():
    """Return all degree requirements as a list of dicts"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM degree_requirements')
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def get_courses_by_status(status):
    """Return all courses with a specific status"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM courses WHERE status = ? ORDER BY semester, id', (status,))
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def update_course_status(course_id, new_status):
    """Update the status of a course"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('UPDATE courses SET status = ? WHERE id = ?', (new_status, course_id))
        conn.commit()

def get_completed_courses():
    """Return all courses with status 'Completed'"""
    return get_courses_by_status('Completed')

def get_total_ects_completed():
    """Return the total ECTS from completed courses"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT SUM(ects) as ects_sum FROM courses WHERE status = "Completed"')
        row = cursor.fetchone()
        return row['ects_sum'] if row and row['ects_sum'] else 0

def get_compulsory_courses_completed():
    """Return the number of compulsory courses completed out of 16"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) as cnt FROM courses WHERE type = "Compulsory" AND status = "Completed"')
        row = cursor.fetchone()
        return row['cnt'] if row else 0

def get_total_compulsory_courses():
    """Return the total number of compulsory courses"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) as cnt FROM courses WHERE type = "Compulsory"')
        row = cursor.fetchone()
        return row['cnt'] if row else 0

def get_elective_courses_completed():
    """Return the number of elective courses completed"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) as cnt FROM courses WHERE type = "Elective" AND status = "Completed"')
        row = cursor.fetchone()
        return row['cnt'] if row else 0

def get_total_elective_courses():
    """Return the total number of elective courses"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) as cnt FROM courses WHERE type = "Elective"')
        row = cursor.fetchone()
        return row['cnt'] if row else 0

def get_project_courses_completed():
    """Return the number of project courses completed"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) as cnt FROM courses WHERE type = "Project" AND status = "Completed"')
        row = cursor.fetchone()
        return row['cnt'] if row else 0

def get_total_project_courses():
    """Return the total number of project courses"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) as cnt FROM courses WHERE type = "Project"')
        row = cursor.fetchone()
        return row['cnt'] if row else 0

def get_optional_courses_completed():
    """Return the number of optional courses completed"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) as cnt FROM courses WHERE type = "Optional" AND status = "Completed"')
        row = cursor.fetchone()
        return row['cnt'] if row else 0

def get_total_optional_courses():
    """Return the total number of optional courses"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) as cnt FROM courses WHERE type = "Optional"')
        row = cursor.fetchone()
        return row['cnt'] if row else 0

def get_free_electives_completed():
    """Return the number of free electives completed"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) as cnt FROM courses WHERE type = "Free Elective" AND status = "Completed"')
        row = cursor.fetchone()
        return row['cnt'] if row else 0

def get_total_free_electives():
    """Return the total number of free electives"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) as cnt FROM courses WHERE type = "Free Elective"')
        row = cursor.fetchone()
        return row['cnt'] if row else 0

def get_remaining_requirements():
    """Calculate and return the remaining degree requirements"""
    completed_ects = get_total_ects_completed()
    requirements = get_degree_requirements()
    remaining = []
    for req in requirements:
        if req['min_courses'] is not None:
            completed_courses = get_courses_by_status('Completed')
            if len(completed_courses) < req['min_courses']:
                remaining.append(req)
        elif req['min_ects'] is not None:
            if completed_ects < req['min_ects']:
                remaining.append(req)
    return remaining

def reset_database():
    """Reset the database by dropping all tables"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('DROP TABLE IF EXISTS courses')
        cursor.execute('DROP TABLE IF EXISTS degree_requirements')
        conn.commit()

# DO NOT UNCOMMENT THIS BLOCK UNLESS YOU WANT TO RESET THE DATABASE


# if __name__ == "__main__":
#     reset_database()  # Drops existing tables
#     init_database()   # Re-creates and fills them
#     courses = get_all_courses()
#     print(f"Total courses in DB: {len(courses)}")