-- SurgicalPrep Sample Instrument Data
-- Run this AFTER schema.sql to populate initial instruments for testing

-- =====================================================
-- SAMPLE INSTRUMENTS - CUTTING CATEGORY
-- =====================================================

INSERT INTO instruments (name, aliases, category, description, primary_uses, common_procedures, handling_notes)
VALUES
(
    'Mayo Scissors (Straight)',
    ARRAY['Mayo Straight', 'Heavy Scissors'],
    'cutting',
    'Heavy scissors with semi-blunt tips, available in straight configuration. Designed for cutting dense tissue and sutures.',
    ARRAY['Cutting fascia and heavy tissue', 'Cutting sutures', 'Cutting drapes and dressings'],
    ARRAY['General surgery', 'Orthopedic surgery', 'Abdominal surgery'],
    'Handle with care to maintain blade sharpness. Clean thoroughly after use. Inspect blade alignment before each procedure.'
),
(
    'Mayo Scissors (Curved)',
    ARRAY['Mayo Curved', 'Curved Mayo'],
    'cutting',
    'Heavy scissors with curved blades and semi-blunt tips. The curve allows for better visualization and cutting in deeper tissue planes.',
    ARRAY['Dissecting dense tissue', 'Cutting fascia', 'Deep tissue work'],
    ARRAY['Laparotomy', 'Thoracotomy', 'Mastectomy'],
    'Curve should face upward during use. Verify blade alignment before procedure.'
),
(
    'Metzenbaum Scissors',
    ARRAY['Metz', 'Metz Scissors', 'Dissecting Scissors'],
    'cutting',
    'Delicate scissors with long handles and short, curved blades. Used for fine dissection of delicate tissue.',
    ARRAY['Fine tissue dissection', 'Undermining tissue', 'Cutting thin tissue layers'],
    ARRAY['Plastic surgery', 'Vascular surgery', 'General surgery'],
    'Delicate instrument - avoid cutting sutures or heavy tissue. Keep tips closed when passing.'
),
(
    '#10 Scalpel Blade',
    ARRAY['10 Blade', 'Belly Blade'],
    'cutting',
    'Curved cutting blade with a large belly, ideal for making long incisions through skin and subcutaneous tissue.',
    ARRAY['Skin incisions', 'Long curved incisions', 'Subcutaneous dissection'],
    ARRAY['Laparotomy', 'Thoracotomy', 'Large incision procedures'],
    'Mount securely on #3 or #7 handle. Always pass with blade facing down in neutral zone. Dispose in sharps container.'
),
(
    '#15 Scalpel Blade',
    ARRAY['15 Blade', 'Small Blade'],
    'cutting',
    'Small curved blade ideal for precise, short incisions. Commonly used for delicate work.',
    ARRAY['Precise skin incisions', 'Stab incisions', 'Ophthalmic procedures'],
    ARRAY['Plastic surgery', 'Hand surgery', 'Ophthalmology'],
    'Mount on #3 handle. Excellent for detailed work. Handle with extreme care.'
);

-- =====================================================
-- SAMPLE INSTRUMENTS - CLAMPING CATEGORY
-- =====================================================

INSERT INTO instruments (name, aliases, category, description, primary_uses, common_procedures, handling_notes)
VALUES
(
    'Kelly Forceps',
    ARRAY['Kelly Clamp', 'Kelly Hemostat'],
    'clamping',
    'Medium-sized hemostatic forceps with transverse serrations extending halfway down the jaw. Available in straight and curved.',
    ARRAY['Clamping blood vessels', 'Grasping tissue', 'Occluding tubular structures'],
    ARRAY['General surgery', 'Gynecological surgery', 'Vascular procedures'],
    'Check ratchet mechanism before use. Do not over-clamp delicate structures.'
),
(
    'Crile Forceps',
    ARRAY['Crile Clamp', 'Crile Hemostat'],
    'clamping',
    'Similar to Kelly forceps but with serrations extending the full length of the jaw. Provides stronger grip.',
    ARRAY['Hemostasis', 'Tissue clamping', 'Vessel occlusion'],
    ARRAY['General surgery', 'Trauma surgery', 'Vascular surgery'],
    'Full serration provides stronger grip. Verify ratchet locks properly.'
),
(
    'Mosquito Forceps',
    ARRAY['Mosquito Clamp', 'Halsted Mosquito', 'Halsted Forceps'],
    'clamping',
    'Small, delicate hemostatic forceps with fine tips. Ideal for clamping small vessels and delicate tissue.',
    ARRAY['Clamping small vessels', 'Delicate hemostasis', 'Fine tissue work'],
    ARRAY['Plastic surgery', 'Pediatric surgery', 'Microsurgery'],
    'Delicate tips can be easily damaged. Use only for appropriate tissue size.'
),
(
    'Kocher Forceps',
    ARRAY['Kocher Clamp', 'Ochsner Forceps'],
    'clamping',
    'Heavy forceps with transverse serrations and a tooth at the tip for secure grip. Used for heavy tissue.',
    ARRAY['Grasping heavy tissue', 'Fascia manipulation', 'Secure tissue holding'],
    ARRAY['Orthopedic surgery', 'Abdominal surgery', 'Trauma surgery'],
    'Teeth can damage delicate tissue - use appropriately. Excellent for fascia.'
),
(
    'Allis Forceps',
    ARRAY['Allis Clamp', 'Allis Tissue Forceps'],
    'clamping',
    'Tissue forceps with multiple interlocking teeth at the tip. Provides secure grip with less crushing.',
    ARRAY['Grasping tissue for retraction', 'Holding fascia', 'Tissue manipulation'],
    ARRAY['General surgery', 'GYN surgery', 'Bowel surgery'],
    'Teeth can cause tissue trauma if used incorrectly. Do not use on bowel serosa.'
);

-- =====================================================
-- SAMPLE INSTRUMENTS - GRASPING CATEGORY
-- =====================================================

INSERT INTO instruments (name, aliases, category, description, primary_uses, common_procedures, handling_notes)
VALUES
(
    'Adson Forceps',
    ARRAY['Adson Pickup', 'Adson Tissue Forceps'],
    'grasping',
    'Small thumb forceps with fine tips, available with or without teeth. Used for delicate tissue handling.',
    ARRAY['Grasping skin edges', 'Delicate tissue handling', 'Suturing assistance'],
    ARRAY['Plastic surgery', 'Skin closure', 'Wound repair'],
    'Available in toothed (1x2) and smooth versions. Toothed for skin, smooth for delicate tissue.'
),
(
    'DeBakey Forceps',
    ARRAY['DeBakey Pickup', 'DeBakey Tissue Forceps'],
    'grasping',
    'Atraumatic forceps with unique parallel serrated tips. Designed for vascular and delicate tissue work.',
    ARRAY['Vascular tissue handling', 'Atraumatic grasping', 'Vessel manipulation'],
    ARRAY['Cardiovascular surgery', 'Vascular surgery', 'Transplant surgery'],
    'Atraumatic design prevents vessel wall damage. Essential for vascular work.'
),
(
    'Russian Forceps',
    ARRAY['Russian Pickup', 'Russian Tissue Forceps'],
    'grasping',
    'Heavy thumb forceps with broad, rounded, cupped tips with serrations. Excellent grip for dense tissue.',
    ARRAY['Grasping tough tissue', 'Fascia handling', 'Heavy tissue manipulation'],
    ARRAY['Orthopedic surgery', 'General surgery', 'Wound closure'],
    'Provides excellent grip on slippery tissue. May cause more tissue trauma than fine forceps.'
),
(
    'Bonney Forceps',
    ARRAY['Bonney Pickup', 'Bonney Tissue Forceps'],
    'grasping',
    'Heavy tissue forceps with large teeth. Designed for grasping tough tissue like uterus or fascia.',
    ARRAY['Grasping uterus', 'Heavy fascia work', 'Tough tissue handling'],
    ARRAY['GYN surgery', 'C-section', 'Hysterectomy'],
    'Heavy teeth for secure grip on uterine tissue. Use with care to avoid tissue damage.'
);

-- =====================================================
-- SAMPLE INSTRUMENTS - RETRACTING CATEGORY
-- =====================================================

INSERT INTO instruments (name, aliases, category, description, primary_uses, common_procedures, handling_notes)
VALUES
(
    'Army-Navy Retractor',
    ARRAY['Army Navy', 'USA Retractor', 'Double-Ended Retractor'],
    'retracting',
    'Double-ended hand-held retractor with different sized blades on each end. Versatile for superficial retraction.',
    ARRAY['Skin retraction', 'Superficial tissue retraction', 'Wound exposure'],
    ARRAY['General surgery', 'Minor procedures', 'Wound exploration'],
    'Hold at appropriate angle to avoid tissue damage. Double-ended for versatility.'
),
(
    'Richardson Retractor',
    ARRAY['Richardson', 'Appendectomy Retractor'],
    'retracting',
    'Right-angle retractor with a curved blade. Commonly used for abdominal wall retraction.',
    ARRAY['Abdominal wall retraction', 'Deep cavity exposure', 'Muscle retraction'],
    ARRAY['Appendectomy', 'Cholecystectomy', 'Abdominal surgery'],
    'Various sizes available. Match size to incision depth and width.'
),
(
    'Deaver Retractor',
    ARRAY['Deaver'],
    'retracting',
    'Large, deep retractor with a curved blade. Used for retracting abdominal organs and walls.',
    ARRAY['Deep abdominal retraction', 'Organ retraction', 'Large cavity exposure'],
    ARRAY['Laparotomy', 'Liver surgery', 'Colon surgery'],
    'Heavy instrument - secure grip required. Protect underlying organs from pressure injury.'
),
(
    'Weitlaner Retractor',
    ARRAY['Weitlaner', 'Self-Retaining Retractor'],
    'retracting',
    'Self-retaining retractor with sharp or blunt prongs and a ratchet mechanism for hands-free retraction.',
    ARRAY['Self-retaining wound exposure', 'Superficial surgery', 'Orthopedic exposure'],
    ARRAY['Orthopedic surgery', 'Neurosurgery', 'Minor procedures'],
    'Verify ratchet mechanism works before use. Sharp prongs can damage tissue.'
);

-- =====================================================
-- SAMPLE INSTRUMENTS - SUTURING CATEGORY
-- =====================================================

INSERT INTO instruments (name, aliases, category, description, primary_uses, common_procedures, handling_notes)
VALUES
(
    'Mayo-Hegar Needle Holder',
    ARRAY['Mayo-Hegar', 'Needle Driver', 'Needle Holder'],
    'suturing',
    'General-purpose needle holder with cross-hatched jaws and ratchet lock. Most common needle holder.',
    ARRAY['Holding suture needles', 'Suturing', 'Needle manipulation'],
    ARRAY['All surgical procedures', 'Wound closure', 'Anastomosis'],
    'Match holder size to needle size. Do not clamp too tightly or jaws may damage needle.'
),
(
    'Crile-Wood Needle Holder',
    ARRAY['Crile-Wood', 'Fine Needle Holder'],
    'suturing',
    'Finer needle holder with tungsten carbide inserts. Excellent for small needles and delicate work.',
    ARRAY['Fine suturing', 'Small needle handling', 'Precise closure'],
    ARRAY['Plastic surgery', 'Vascular surgery', 'Microsurgery'],
    'Tungsten carbide jaws provide excellent grip. Handle with care.'
),
(
    'Castroviejo Needle Holder',
    ARRAY['Castroviejo', 'Micro Needle Holder'],
    'suturing',
    'Micro needle holder with spring-action handle and locking mechanism. Used for microsurgery.',
    ARRAY['Microsurgery', 'Ophthalmic suturing', 'Fine vascular work'],
    ARRAY['Ophthalmology', 'Microsurgery', 'Hand surgery'],
    'Delicate instrument - handle with extreme care. Lock mechanism prevents fatigue.'
);

-- =====================================================
-- SAMPLE TEMPLATE PREFERENCE CARD
-- =====================================================

-- First, create a system user for template cards
INSERT INTO users (id, email, password_hash, full_name, role, subscription_tier)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'system@surgicalprep.app',
    'NOT_A_REAL_USER',
    'System Templates',
    'educator',
    'premium'
);

-- Create a sample template card
INSERT INTO preference_cards (id, user_id, title, surgeon_name, procedure_name, specialty, general_notes, setup_notes, is_template, is_public)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000001',
    'Laparoscopic Cholecystectomy - Standard Setup',
    'Template',
    'Laparoscopic Cholecystectomy',
    'General Surgery',
    'Standard lap chole setup. Adjust based on surgeon preference and patient factors.',
    'Set up back table with instruments grouped by function. Verify camera and insufflator before patient in room.',
    true,
    true
);

-- Add items to the template card (using instrument IDs - you may need to update these)
INSERT INTO preference_card_items (card_id, custom_name, category, quantity, size, notes, sort_order)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Laparoscope 30°', 'instruments', 1, '10mm', 'Check white balance before use', 1),
    ('11111111-1111-1111-1111-111111111111', 'Veress Needle', 'instruments', 1, NULL, 'Verify spring mechanism', 2),
    ('11111111-1111-1111-1111-111111111111', '10mm Trocar', 'instruments', 2, '10mm', 'Camera port and specimen extraction', 3),
    ('11111111-1111-1111-1111-111111111111', '5mm Trocar', 'instruments', 2, '5mm', 'Working ports', 4),
    ('11111111-1111-1111-1111-111111111111', 'Maryland Dissector', 'instruments', 1, '5mm', NULL, 5),
    ('11111111-1111-1111-1111-111111111111', 'Grasper', 'instruments', 2, '5mm', 'Fundus retraction', 6),
    ('11111111-1111-1111-1111-111111111111', 'Clip Applier', 'instruments', 1, 'Medium-Large', 'Verify clip loading', 7),
    ('11111111-1111-1111-1111-111111111111', 'Hook Cautery', 'instruments', 1, '5mm', NULL, 8),
    ('11111111-1111-1111-1111-111111111111', 'Specimen Bag', 'supplies', 1, 'Medium', NULL, 9),
    ('11111111-1111-1111-1111-111111111111', 'Clips', 'supplies', 2, 'Medium-Large', 'Cartridges', 10),
    ('11111111-1111-1111-1111-111111111111', '0 Vicryl', 'sutures', 1, 'CT-1', 'Fascia closure if needed', 11),
    ('11111111-1111-1111-1111-111111111111', '4-0 Monocryl', 'sutures', 1, 'PS-2', 'Skin closure', 12);

-- =====================================================
-- VERIFY DATA
-- =====================================================

-- Count instruments by category
SELECT category, COUNT(*) as count 
FROM instruments 
GROUP BY category 
ORDER BY count DESC;

-- Verify search works
SELECT name, category, ts_rank(search_vector, plainto_tsquery('english', 'scissors')) as rank
FROM instruments 
WHERE search_vector @@ plainto_tsquery('english', 'scissors')
ORDER BY rank DESC;
