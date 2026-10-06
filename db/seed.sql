-- Sample data for the Liberia Billboard Media admin console.
-- Idempotent: safe to run multiple times.

-- Billboards -----------------------------------------------------------------
INSERT OR IGNORE INTO billboards (id,code,name,city,location,format,width_ft,height_ft,facing,monthly_rate,status,notes,created_at) VALUES
 ('bb-001','MON-D01','Tubman Boulevard Digital','Monrovia','Tubman Blvd, Sinkor','Digital billboard',48,14,'Southbound',1200,'booked','Prime commuter corridor.',1717200000000),
 ('bb-002','MON-S02','Broad Street Static','Monrovia','Broad St, CBD','Static billboard',40,20,'Northbound',650,'available','Downtown retail footfall.',1717200000000),
 ('bb-003','PAY-D03','Red Light Digital','Paynesville','Red Light Market Jct','Digital billboard',48,14,'Eastbound',1350,'booked','Busiest market intersection.',1717200000000),
 ('bb-004','MON-S04','UN Drive Waterfront','Monrovia','UN Drive','Static billboard',36,18,'Westbound',600,'available','Port approach visibility.',1717200000000),
 ('bb-005','CON-D05','Congo Town Digital','Congo Town','Tubman Blvd, Ministerial','Digital billboard',44,14,'Southbound',1150,'reserved','Government district.',1717200000000),
 ('bb-006','GAR-S06','Somalia Drive Highway','Gardnersville','Somalia Drive','Static billboard',40,20,'Both',700,'available','Major freight route.',1717200000000),
 ('bb-007','MON-S07','Randall Street Static','Monrovia','Randall St, CBD','Static billboard',30,15,'Eastbound',550,'maintenance','Panel refurbishment in progress.',1717200000000),
 ('bb-008','PAY-S08','ELWA Junction Static','Paynesville','ELWA Junction','Static billboard',40,20,'Northbound',680,'available','High-traffic roundabout.',1717200000000),
 ('bb-009','MON-D09','Sinkor 12th Street Digital','Monrovia','Tubman Blvd, 12th St','Digital billboard',48,14,'Northbound',1250,'available','Shopping and dining strip.',1717200000000),
 ('bb-010','CAR-S10','Duala Market Static','Monrovia','Duala Market, Bushrod Is.','Static billboard',36,18,'Westbound',600,'booked','Wholesale market district.',1717200000000);

-- Clients --------------------------------------------------------------------
INSERT OR IGNORE INTO clients (id,name,company,email,phone,city,status,notes,created_at) VALUES
 ('cl-001','Musu Kamara','Lonestar Cell MTN','musu.kamara@lonestarcell.com','+231770111222','Monrovia','active','Long-term telecom advertiser.',1717200000000),
 ('cl-002','James Toe','Liberia Coca-Cola Bottling','james.toe@ccbc.lr','+231880333444','Monrovia','active','Seasonal beverage campaigns.',1717200000000),
 ('cl-003','Fatu Sesay','Ecobank Liberia','fatu.sesay@ecobank.com','+231770555666','Monrovia','active','Retail banking promotions.',1717200000000),
 ('cl-004','Emmanuel Weah','Orange Liberia','e.weah@orange.lr','+231770777888','Paynesville','prospect','Evaluating digital rotation.',1717200000000),
 ('cl-005','Grace Johnson','Liberia Revenue Authority','grace.johnson@lra.gov.lr','+231880999000','Monrovia','prospect','Public awareness campaign inquiry.',1717200000000),
 ('cl-006','Prince Doe','Aqua Mineral Water','prince.doe@aqua.lr','+231770121314','Congo Town','active','Static coverage on freight routes.',1717200000000),
 ('cl-007','Hawa Barclay','Cellcom / GT','hawa.barclay@gt.lr','+231880151617','Monrovia','past','Ran a 3-month 2024 campaign.',1717200000000),
 ('cl-008','Samuel Nyumah','APM Terminals Liberia','s.nyumah@apmterminals.com','+231770181920','Monrovia','prospect','Port branding interest.',1717200000000),
 ('cl-009','Patience Flomo','Flomo Fashion','patience@flomofashion.lr','+231770323334','Monrovia','active','Holiday fashion campaign, contracted.',1722124800000),
 ('cl-010','Alfred Gbala',NULL,'alfred.gbala@gmail.com','+231880232425','Paynesville','prospect','Church conference promotion, quoted.',1724544000000),
 ('cl-011','Nyema Karnga','Bridge Microfinance','nyema@bridgemfi.lr','+231770262728','Monrovia','prospect','Savings campaign, quoted.',1723334400000);

-- Contracts ------------------------------------------------------------------
-- submitted = 0 -> Pending; submitted = 1 -> status derived from start/end vs today.
INSERT OR IGNORE INTO contracts (id,client_id,billboard_id,inquiry_id,campaign_name,start_date,end_date,amount,terms,submitted,status,created_at) VALUES
 ('ct-001','cl-001','bb-001',NULL,'MTN Data Bundles Q2','2026-04-01','2026-09-30',7200,'Net-30 billing. Creative refresh mid-flight.',1,'active',1717200000000),
 ('ct-002','cl-002','bb-003',NULL,'Coca-Cola Dry Season','2026-05-01','2026-08-31',5400,'Paid in full upfront.',1,'expired',1717200000000),
 ('ct-003','cl-003','bb-010',NULL,'Ecobank Xpress Account','2026-11-01','2027-04-30',5400,'Two equal installments.',1,'coming_soon',1717200000000),
 ('ct-004','cl-006','bb-006',NULL,'Aqua Freight Routes','2026-03-01','2026-05-31',2100,'Single payment.',1,'expired',1717200000000),
 ('ct-005','cl-007','bb-002',NULL,'GT New Year 2024','2024-12-01','2025-02-28',1950,'Completed 2024 campaign.',1,'expired',1717200000000),
 ('ct-006','cl-001','bb-009',NULL,'MTN Sinkor Digital','2026-07-01','2026-12-31',7500,'Draft terms pending review.',0,'pending',1717200000000),
 ('ct-007','cl-009','bb-005','inq-005','Flomo Holiday Fashion','2026-09-01','2027-02-28',900,'Short holiday burst, digital rotation.',1,'active',1725580800000);

-- Inquiries ------------------------------------------------------------------
-- status: new | quoted | contracted
INSERT OR IGNORE INTO inquiries (id,name,company,email,phone,city,format,start_date,duration,message,client_id,quote_amount,quote_details,status,created_at) VALUES
 ('inq-001','Rebecca Cooper','Kula Foods','rebecca@kulafoods.lr','+231770202122','Monrovia','Digital billboard','2026-10-01','3 months','Launching a new rice brand, want Sinkor visibility.',NULL,NULL,NULL,'new',1725148800000),
 ('inq-002','Alfred Gbala',NULL,'alfred.gbala@gmail.com','+231880232425','Paynesville','Static billboard','2026-09-15','1 month','Church conference promotion near Red Light.','cl-010',1300,'One month on ELWA Junction static, includes print + install.','quoted',1724544000000),
 ('inq-003','Nyema Karnga','Bridge Microfinance','nyema@bridgemfi.lr','+231770262728','Monrovia','Help me choose',NULL,'6 months','Need help picking locations for a savings campaign.','cl-011',4200,'Six-month mix of two static sites in Monrovia CBD.','quoted',1723334400000),
 ('inq-004','Otis Bright','Bright Autos','otis@brightautos.lr','+231880293031','Congo Town','Static billboard','2026-11-01','Other / flexible','Car dealership, flexible on dates.',NULL,NULL,NULL,'new',1725580800000),
 ('inq-005','Patience Flomo','Flomo Fashion','patience@flomofashion.lr','+231770323334','Monrovia','Digital billboard','2026-12-01','2 weeks','Holiday fashion sale, short burst campaign.','cl-009',900,'Two-week digital burst on Congo Town Digital.','contracted',1722124800000);
