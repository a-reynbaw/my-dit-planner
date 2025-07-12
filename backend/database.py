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
            S6 TEXT,
            grade REAL
        )
    ''')

    courses = [
        # semester 1
        ('Γραμμική Άλγεβρα', 'Κ03', 6, 1, 'Not Taken', 'ΥΜ', 'COM', None, None, None, None, None, None, None),
        ('Διακριτά Μαθηματικά', 'Κ09', 7, 1, 'Not Taken', 'ΥΜ', 'COM', None, None, None, None, None, None, None),
        ('Εισαγωγή στην Πληροφορική και στις Τηλεπικοινωνίες', 'ΓΠ07', 2, 1, 'Not Taken', 'ΓΠ', 'COM', None, None, None, None, None, None, None),
        ('Εισαγωγή στον Προγραμματισμό', 'Κ04', 7, 1, 'Not Taken', 'ΥΜ', 'COM', None, None, None, None, None, None, None),
        ('Εργαστήριο Λογικής Σχεδίασης', 'K02ε', 2, 1, 'Not Taken', 'ΕΡ', 'COM', None, None, None, None, None, None, None),
        ('Λογική Σχεδίαση', 'Κ02', 6, 1, 'Not Taken', 'ΥΜ', 'COM', None, None, None, None, None, None, None),

        # semester 2
        ('Ανάλυση Ι', 'Κ01', 8, 2, 'Not Taken', 'ΥΜ', 'COM', None, None, None, None, None, None, None),
        ('Αρχιτεκτονική Υπολογιστών Ι', 'Κ14', 7, 2, 'Not Taken', 'ΥΜ', 'COM', None, None, None, None, None, None, None),
        ('Δομές Δεδομένων και Τεχνικές Προγραμματισμού', 'Κ08', 7, 2, 'Not Taken', 'ΥΜ', 'COM', None, None, None, None, None, None, None),
        ('Εφαρμοσμένα Μαθηματικά', 'Κ20β', 6, 2, 'Not Taken', 'ΠΜ', 'CET', None, None, None, None, None, 'B', None),
        ('Ηλεκτρομαγνητισμός – Οπτική και Σύγχρονη Φυσική', 'Κ12', 8, 2, 'Not Taken', 'ΥΜ', 'COM', None, None, None, None, None, None, None),

        # semester 3
        ('Ανάλυση ΙΙ', 'Κ06', 8, 3, 'Not Taken', 'ΥΜ', 'COM', None, None, None, None, None, None, None),
        ('Αντικειμενοστραφής Προγραμματισμός', 'Κ10', 8, 3, 'Not Taken', 'ΥΜ', 'COM', None, None, None, None, None, None, None),
        ('Εργαστήριο Κυκλωμάτων και Συστημάτων', 'Κ11ε', 2, 3, 'Not Taken', 'ΕΡ', 'COM', None, None, None, None, None, None, None),
        ('Πιθανότητες και Στατιστική', 'Κ13', 6, 3, 'Not Taken', 'ΥΜ', 'COM', None, None, None, None, None, None, None),
        ('Σήματα και Συστήματα', 'Κ11', 6, 3, 'Not Taken', 'ΥΜ', 'COM', None, None, None, None, None, None, None),

        # semester 4
        ('Αλγόριθμοι και Πολυπλοκότητα', 'Κ17', 8, 4, 'Not Taken', 'ΥΜ', 'COM', None, None, None, None, None, None, None),
        ('Δίκτυα Επικοινωνιών I', 'Κ16', 6, 4, 'Not Taken', 'ΥΜ', 'COM', None, None, None, None, None, None, None),
        ('Εργαστήριο Δικτύων Επικοινωνιών Ι', 'Κ16ε', 2, 4, 'Not Taken', 'ΕΡ', 'COM', None, None, None, None, None, None, None),
        ('Συστήματα Επικοινωνιών', 'Κ21', 7, 4, 'Not Taken', 'ΥΜ', 'COM', None, None, None, None, None, None, None),
        ('Σχεδίαση και Χρήση Βάσεων Δεδομένων', 'Κ29', 7, 4, 'Not Taken', 'ΥΜ', 'COM', None, None, None, None, None, None, None),

        # semester 5
        ('Αριθμητική Ανάλυση', 'Κ15', 6, 5, 'Not Taken', 'ΕΥΜ', 'COM', 'Υ', None, None, None, None, None, None),
        ('Αρχές Γλωσσών Προγραμματισμού', 'ΘΠ01', 6, 5, 'Not Taken', 'ΠΜ', 'CS', 'B', 'B', None, None, None, None, None),
        ('Αρχιτεκτονική Υπολογιστών ΙΙ', 'Κ30', 6, 5, 'Not Taken', 'ΕΥΜ', 'CS', None, None, 'B', 'Υ', None, None, None),
        ('Γραφικά Ι', 'ΘΠ02', 6, 5, 'Not Taken', 'ΠΜ', 'COM', 'B', None, None, None, None, 'B', None),
        ('Δίκτυα Επικοινωνιών II', 'Κ33', 6, 5, 'Not Taken', 'ΕΥΜ', 'COM', None, None, None, None, 'Υ', None, None),
        ('Εργαστήριο Δικτύων Επικοινωνιών Ι', 'Κ16ε', 2, 5, 'Not Taken', 'ΕΡ', 'COM', None, None, None, None, None, None, None),
        ('Κύματα, Κυματοδηγοί, Κεραίες', 'ΕΠ05', 6, 5, 'Not Taken', 'ΠΜ', 'CET', None, None, None, None, 'B', None, None),
        ('Λειτουργικά Συστήματα', 'Κ22', 8, 5, 'Not Taken', 'ΥΜ', 'COM', None, None, None, None, None, None, None),
        ('Παράλληλα Συστήματα', 'ΘΠ04', 6, 5, 'Not Taken', 'ΠΜ', 'COM', None, None, 'B', 'B', None, None, None),
        ('Σχεδίαση Ψηφιακών Συστημάτων - VHDL', 'ΥΣ03', 6, 5, 'Not Taken', 'ΠΜ', 'CET', None, None, None, 'B', None, None, None),
        ('Τεχνητή Νοημοσύνη I', 'ΥΣ02', 6, 5, 'Not Taken', 'ΠΜ', 'CS', None, 'B', 'B', None, None, None, None),
        ('Τηλεπικοινωνιακά Δίκτυα', 'ΕΠ20', 6, 5, 'Not Taken', 'ΠΜ', 'CET', None, None, None, None, 'B', None, None),
        ('Υλοποίηση Συστημάτων Βάσεων Δεδομένων', 'Κ18', 6, 5, 'Not Taken', 'ΕΥΜ', 'COM', None, 'Υ', 'Υ', None, None, None, None),
        ('Ψηφιακή Επεξεργασία Σήματος', 'Κ32', 6, 5, 'Not Taken', 'ΕΥΜ', 'COM', None, None, None, None, None, 'Υ', None),

        # semester 6
        ('Αλγόριθμοι-Θεμελιώσεις Μηχανικής Μάθησης', 'ΘΠ16β', 6, 6, 'Not Taken', 'ΠΜ', 'CS', 'B', 'B', None, None, None, None, None),
        ('Αναγνώριση Προτύπων–Μηχανική Μάθηση', 'ΕΠ08', 6, 6, 'Not Taken', 'ΠΜ', 'COM', 'B', 'B', None, None, None, 'B', None),
        ('Ανάλυση/Σχεδίαση Συστημάτων Λογισμικού', 'ΥΣ04', 6, 6, 'Not Taken', 'ΠΜ', 'CS', None, None, 'B', None, None, None, None),
        ('Ασύρματα Δίκτυα Αισθητήρων', 'ΥΣ18', 6, 6, 'Not Taken', 'ΠΜ', 'CET', None, None, None, 'B', 'B', None, None),
        ('Διαχείριση Δικτύων', 'Κ34', 6, 6, 'Not Taken', 'ΕΥΜ', 'COM', None, None, None, None, 'Υ', None, None),
        ('Ειδικά Θέματα Επικοινωνιών και Επεξεργασίας Σήματος – Πολυμέσα και Ασύρματη Δικτύωση', 'ΕΠ22β', 4, 6, 'Not Taken', 'ΠΜ', 'COM', None, None, None, None, None, None, None),
        ('Επεξεργασία Στοχαστικών Σημάτων', 'ΕΠ07', 6, 6, 'Not Taken', 'ΠΜ', 'CET', None, None, None, None, 'B', 'B', None),
        ('Επιστημονικοί Υπολογισμοί', 'ΘΠ03', 6, 6, 'Not Taken', 'ΠΜ', 'CS', 'B', None, None, None, None, None, None),
        ('Εργαστήριο Ηλεκτρονικής', 'Κ19ε', 6, 6, 'Not Taken', 'ΠΜ', 'CET', None, None, None, 'B', None, None, None),
        ('Ηλεκτρονική', 'K19', 6, 6, 'Not Taken', 'ΕΥΜ', 'COM', None, None, None, 'Υ', None, None, None),
        ('Θεωρία Πληροφορίας και Κωδίκων', 'Κ35', 6, 6, 'Not Taken', 'ΕΥΜ', 'COM', None, None, None, None, None, 'Υ', None),
        ('Θεωρία Υπολογισμού', 'Κ25', 6, 6, 'Not Taken', 'ΕΥΜ', 'COM', None, 'Υ', None, None, None, None, None),
        ('Λογικός Προγραμματισμός', 'ΥΣ05', 6, 6, 'Not Taken', 'ΠΜ', 'CS', None, 'B', None, None, None, None, None),
        ('Μαθηματικά Πληροφορικής', 'Κ20α', 6, 6, 'Not Taken', 'ΕΥΜ', 'COM', 'Υ', None, None, None, None, None, None),
        ('Μεταγλωττιστές', 'Κ31', 6, 6, 'Not Taken', 'ΕΥΜ', 'CET', None, None, 'Υ', 'B', None, None, None),
        ('Προγραμματισμός Συστήματος', 'Κ24', 8, 6, 'Not Taken', 'ΥΜ', 'COM', None, None, None, None, None, None, None),
        ('Τεχνητή Νοημοσύνη ΙΙ (Βαθιά Μηχανική Μάθηση για την Επεξεργασία Φυσικής Γλώσσας)', 'ΥΣ19', 6, 6, 'Not Taken', 'ΠΜ', 'CS', None, 'B', None, None, None, None, None),
        ('Τεχνικές Εξόρυξης Δεδομένων', 'ΥΣ11', 6, 6, 'Not Taken', 'ΠΜ', 'CS', None, 'B', None, None, None, None, None),
        ('Τεχνολογίες Εφαρμογών Διαδικτύου', 'ΥΣ14', 6, 6, 'Not Taken', 'ΠΜ', 'COM', None, None, 'B', None, 'B', None, None),

        # semester 7
        ('Αλγοριθμική Επιχειρησιακή Έρευνα', 'ΘΠ09', 6, 7, 'Not Taken', 'ΠΜ', 'COM', 'B', 'B', None, None, None, 'B', None),
        ('Ανάπτυξη Λογισμικού για Αλγοριθμικά Προβλήματα', 'Κ23γ', 8, 7, 'Not Taken', '', 'COM', None, None, None, None, None, None, None),
        ('Ανάπτυξη Λογισμικού για Πληροφοριακά Συστήματα', 'Κ23α', 8, 7, 'Not Taken', '', 'COM', None, None, None, None, None, None, None),
        ('Ανάπτυξη Λογισμικού για Συστήματα Δικτύων και Τηλεπικοινωνιών', 'Κ23β', 8, 7, 'Not Taken', '', 'COM', None, None, None, None, None, None, None),
        ('Διδακτική της Πληροφορικής', 'ΥΣ10', 6, 7, 'Not Taken', 'ΠΜ', 'COM', None, None, None, None, None, None, None),
        ('Δομή και Θεσμοί της Ευρωπαϊκής Ένωσης', 'ΓΠ03', 2, 7, 'Not Taken', 'ΓΠ', 'COM', None, None, None, None, None, None, None),
        ('Ειδικά Θέματα Επικοινωνιών και Επεξεργασίας Σήματος: Ειδικά Θέματα Κβαντικής Πληροφορίας και Υπολογιστικής', 'ΕΠ22δ', 4, 7, 'Not Taken', 'ΠΜ', 'COM', None, None, None, None, None, None, None),
        ('Ειδικά Θέματα Υπολογιστικών Συστημάτων και Εφαρμογών', 'ΥΣ16', 4, 7, 'Not Taken', 'ΠΜ', 'COM', None, None, None, None, None, None, None),
        ('Ειδικά Θέματα Υπολογιστικών Συστημάτων και Εφαρμογών – Τεχνολογίες Γνώσεων', 'ΥΣ16β', 4, 7, 'Not Taken', 'ΠΜ', 'COM', None, None, None, None, None, None, None),
        ('Ενισχυτική Μηχανική Μάθηση και Στοχαστικά Παίγνια', 'ΕΠ22α', 6, 7, 'Not Taken', 'ΠΜ', 'COM', None, None, None, None, None, None, None),
        ('Επικοινωνία Ανθρώπου Μηχανής', 'ΥΣ08', 6, 7, 'Not Taken', 'ΠΜ', 'CS', None, 'B', 'B', None, None, None, None),
        ('Ηλεκτρονική Διακυβέρνηση', 'ΥΣ17', 4, 7, 'Not Taken', 'ΠΜ', 'COM', None, None, None, None, None, None, None),
        ('Θεωρία Αριθμών', 'ΘΠ08', 6, 7, 'Not Taken', 'ΠΜ', 'COM', None, None, None, None, None, None, None),
        ('Οπτικές Επικοινωνίες και Οπτικά Δίκτυα', 'ΕΠ16', 6, 7, 'Not Taken', 'ΠΜ', 'CET', None, None, None, 'B', 'B', None, None),
        ('Πληροφοριακά Συστήματα', 'ΥΣ07', 6, 7, 'Not Taken', 'ΠΜ', 'COM', None, None, None, None, None, None, None),
        ('Προηγμένα Θέματα Αλγορίθμων', 'ΘΠ12', 6, 7, 'Not Taken', 'ΠΜ', 'CS', 'B', None, None, None, None, None, None),
        ('Προηγμένοι Επιστημονικοί Υπολογισμοί', 'ΘΠ18', 6, 7, 'Not Taken', 'ΠΜ', 'COM', None, None, None, None, None, None, None),
        ('Συστήματα Κινητών και Προσωπικών Επικοινωνιών', 'ΕΠ18', 6, 7, 'Not Taken', 'ΠΜ', 'CET', None, None, None, None, 'B', None, None),
        ('Συστήματα Ψηφιακής Επεξεργασίας Σημάτων σε Πραγματικό Χρόνο', 'ΕΠ11', 6, 7, 'Not Taken', 'ΠΜ', 'CET', None, None, None, 'B', None, 'B', None),
        ('Σχεδίαση VLSI Κυκλωμάτων', 'ΕΠ01', 6, 7, 'Not Taken', 'ΠΜ', 'CET', None, None, None, 'B', None, None, None),
        ('Τεχνολογίες της Πληροφορίας και των Επικοινωνιών (ΤΠΕ) στη Μάθηση', 'ΥΣ15', 6, 7, 'Not Taken', 'ΠΜ', 'COM', None, None, None, None, None, None, None),
        ('Υπολογιστική Πολυπλοκότητα', 'ΘΠ20', 6, 7, 'Not Taken', 'ΠΜ', 'CS', 'B', None, None, None, None, None, None),
        ('Ψηφιακή Προσβασιμότητα και Υποστηρικτικές Τεχνολογίες Πληροφορικής', 'ΥΣ22', 6, 7, 'Not Taken', 'ΠΜ', 'COM', None, None, None, None, None, None, None),

        # semester 8
        ('Αλγοριθμική Επίλυση Προβλημάτων', 'ΘΠ24', 6, 8, 'Not Taken', 'ΠΜ', 'COM', None, None, None, None, None, None, None),
        ('Ανάλυση Εικόνας και Τεχνητή Όραση', 'ΕΠ23', 6, 8, 'Not Taken', 'ΠΜ', 'COM', None, None, None, None, None, None, None),
        ('Ανάπτυξη Υλικού-Λογισμικού για Ενσωματωμένα Συστήματα', 'Κ23δ', 8, 8, 'Not Taken', '', 'COM', None, None, None, None, None, None, None),
        ('Ασύρματες Zεύξεις', 'ΕΠ13', 6, 8, 'Not Taken', 'ΠΜ', 'COM', None, None, None, None, None, None, None),
        ('Διοίκηση Έργων και Τεχνικές Παρουσίασης και Συγγραφής Επιστημονικών Εκθέσεων', 'ΓΠ05', 2, 8, 'Not Taken', 'ΓΠ', 'COM', None, None, None, None, None, None, None),
        ('Ειδικά Θέματα Επικοινωνιών και Επεξεργασίας Σήματος: Γραμμές μεταφοράς, κυματοδηγοί και οπτικές ίνες', 'ΕΠ22γ', 4, 8, 'Not Taken', 'ΠΜ', 'COM', None, None, None, None, None, None, None),
        ('Ειδικά Θέματα Επικοινωνιών και Επεξεργασίας Σήματος: Ειδικά Θέματα Κβαντικής Μηχανικής Μάθησης', 'ΕΠ22ε', 4, 8, 'Not Taken', 'ΠΜ', 'COM', None, None, None, None, None, None, None),
        ('Ειδικά Θέματα Θεωρητικής Πληροφορικής: Αλγόριθμοι Δομικής Βιοπληροφορικής', 'ΘΠ16δ', 6, 8, 'Not Taken', 'ΠΜ', 'COM', None, None, None, None, None, None, None),
        ('Ειδικά Θέματα Υπολογιστικών Συστημάτων και Εφαρμογών', 'ΥΣ16', 4, 8, 'Not Taken', 'ΠΜ', 'COM', None, None, None, None, None, None, None),
        ('Ειδικά Θέματα Υπολογιστικών Συστημάτων και Εφαρμογών: Υπολογιστικά Συστήματα Μεγάλης Κλίμακας', 'ΥΣ16α', 4, 8, 'Not Taken', 'ΠΜ', 'COM', None, None, None, None, None, None, None),
        ('Επεξεργασία Εικόνας', 'ΕΠ10', 6, 8, 'Not Taken', 'ΠΜ', 'CET', None, None, None, None, None, 'B', None),
        ('Επεξεργασία Ομιλίας και Φυσικής Γλώσσας', 'ΕΠ19', 6, 8, 'Not Taken', 'ΠΜ', 'CET', None, None, None, None, None, 'B', None),
        ('Θεωρία Γραφημάτων', 'ΘΠ10', 6, 8, 'Not Taken', 'ΠΜ', 'CS', 'B', None, None, None, None, None, None),
        ('Ιστορία της Πληροφορικής και των Τηλεπικοινωνιών', 'ΥΣ20', 4, 8, 'Not Taken', 'ΠΜ', 'COM', None, None, None, None, None, None, None),
        ('Καινοτομία και Επιχειρηματικότητα', 'ΥΣ12', 4, 8, 'Not Taken', 'ΠΜ', 'COM', None, None, None, None, None, None, None),
        ('Κρυπτογραφία', 'ΘΠ05', 6, 8, 'Not Taken', 'ΠΜ', 'CS', 'B', None, None, None, None, None, None),
        ('Μικροοικονομική Ανάλυση', 'ΕΠ24', 4, 8, 'Not Taken', 'ΠΜ', 'COM', None, None, None, None, None, None, None),
        ('Μουσική Πληροφορική', 'ΕΠ21', 4, 8, 'Not Taken', 'ΠΜ', 'CET', None, None, None, None, None, 'B', None),
        ('Παράλληλοι Αλγόριθμοι', 'ΘΠ19', 6, 8, 'Not Taken', 'ΠΜ', 'COM', None, None, None, None, None, None, None),
        ('Προστασία και Ασφάλεια Υπολογιστικών Συστημάτων', 'ΥΣ13', 6, 8, 'Not Taken', 'ΠΜ', 'CS', None, None, 'B', None, None, None, None),
        ('Σημασιολογία Γλωσσών Προγραμματισμού', 'ΘΠ16α', 6, 8, 'Not Taken', 'ΠΜ', 'CS', 'B', 'B', None, None, None, None, None),
        ('Σχολική Τάξη & Μικροδιδασκαλία', 'ΥΣ21', 6, 8, 'Not Taken', 'ΠΜ', 'COM', None, None, None, None, None, None, None),
        ('Τεχνολογία Λογισμικού', 'ΥΣ09', 6, 8, 'Not Taken', 'ΠΜ', 'CS', None, None, 'B', None, None, None, None),
        ('Υπολογιστική Γεωμετρία', 'ΘΠ11', 6, 8, 'Not Taken', 'ΠΜ', 'CS', 'B', None, None, None, None, None, None),
        ('Υπολογιστική Θεωρία Μηχανικής Μάθησης', 'ΘΠ23', 6, 8, 'Not Taken', 'ΠΜ', 'CS', 'B', 'B', None, None, None, None, None),
        ('Φωτονική', 'ΕΠ12', 6, 8, 'Not Taken', 'ΠΜ', 'COM', None, None, None, None, None, None, None),
        ('Ψηφιακές Επικοινωνίες', 'ΕΠ04', 6, 8, 'Not Taken', 'ΠΜ', 'CET', None, None, None, None, 'B', None, None)
    ]
    try:
        for name, code, ects, semester, status, type_, direction, S1, S2, S3, S4, S5, S6, grade in courses:
            cursor.execute(
                '''INSERT OR IGNORE INTO courses (name, code, ects, semester, status, type, direction, S1, S2, S3, S4, S5, S6, grade)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                (name, code, ects, semester, status, type_, direction, S1, S2, S3, S4, S5, S6, None)
            )
        conn.commit()
    except Exception as e:
        print(f"Error inserting courses: {str(e)}")


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

# def get_degree_requirements():
#     """Return all degree requirements as a list of dicts"""
#     with get_db_connection() as conn:
#         cursor = conn.cursor()
#         cursor.execute('SELECT * FROM degree_requirements')
#         rows = cursor.fetchall()
#         return [dict(row) for row in rows]

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

def update_course_grade(course_id, new_grade):
    """Upadate the grade of a course"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('UPDATE courses SET grade = ? WHERE id = ?', (new_grade, course_id))
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

def reset_database():
    """Reset the database by dropping all tables"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('DROP TABLE IF EXISTS courses')
        cursor.execute('DROP TABLE IF EXISTS degree_requirements')
        conn.commit()

# DO NOT UNCOMMENT THIS BLOCK UNLESS YOU WANT TO RESET THE DATABASE

if __name__ == "__main__":
    reset_database()  # Drops existing tables
    init_database()   # Re-creates and fills them
    courses = get_all_courses()
    print(f"Total courses in DB: {len(courses)}")