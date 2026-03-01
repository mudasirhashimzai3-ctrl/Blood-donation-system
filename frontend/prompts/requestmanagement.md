
This is my project Blood donation system backend and frontend.
i want to make it in react ts + tailwind v4 + Django drf.
well-structures and modular.
 modular backend and frontend.
In frontend each module should have pages, components, hooks, stores, schemas queries, services(api calls) and types folders.
each code should be in the appropriate folder.
now i want you to plan the blood request module module.
Workflow / Control

recipient (FK → Recipient)
hospital (FK → Hospital)
blood_group
units_needed
request_type( normal, urgent, critical,... )
priority
estimated_time_to_fulfill 
nearby_donors_count 
total_notified_donors
assigned_donor (FK → Donor, nullable)
auto_match_enabled (True/False)

location_lat
location_lon
status (pending / matched / completed /cancelled )
is_active


rejection_reason
cancelled_by (Admin / Recipient)
is_verified (Hospital verification)
is_emergency
response_deadline (DateTimeField)

created_at
updated_at
matched_at
completed_at
cancelled_at
attachments
medical_report
prescription_image
emergency_proof