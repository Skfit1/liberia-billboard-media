import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Public quote requests submitted from the marketing site.
export const inquiries = sqliteTable("inquiries", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company"),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  city: text("city").notNull(),
  format: text("format").notNull(),
  startDate: text("start_date"),
  duration: text("duration").notNull(),
  message: text("message"),
  // Link to the resolved client (created/matched when the inquiry is submitted).
  clientId: text("client_id"),
  // Quote captured by the admin before contracting.
  quoteAmount: integer("quote_amount"), // in USD
  quoteDetails: text("quote_details"),
  // Admin workflow: new | quoted | contracted
  status: text("status").notNull().default("new"),
  createdAt: integer("created_at").notNull(),
});

// Physical billboard inventory managed from the admin dashboard.
export const billboards = sqliteTable("billboards", {
  id: text("id").primaryKey(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  location: text("location").notNull(),
  format: text("format").notNull(), // Digital billboard | Static billboard
  widthFt: integer("width_ft"),
  heightFt: integer("height_ft"),
  facing: text("facing"),
  monthlyRate: integer("monthly_rate"), // in USD
  // available | booked | maintenance | reserved
  status: text("status").notNull().default("available"),
  notes: text("notes"),
  createdAt: integer("created_at").notNull(),
});

// Advertiser / client directory.
export const clients = sqliteTable("clients", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company"),
  email: text("email").notNull(),
  phone: text("phone"),
  city: text("city"),
  // prospect | active | past
  status: text("status").notNull().default("prospect"),
  notes: text("notes"),
  createdAt: integer("created_at").notNull(),
});

// Signed campaign contracts linking a client to a billboard.
export const contracts = sqliteTable("contracts", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull(),
  billboardId: text("billboard_id"),
  // Originating quoted inquiry (when the contract was started from an inquiry).
  inquiryId: text("inquiry_id"),
  campaignName: text("campaign_name").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  amount: integer("amount"), // total value in USD
  terms: text("terms"),
  // 0 = saved but not submitted (Pending); 1 = submitted (status derived from dates).
  submitted: integer("submitted").notNull().default(0),
  // Stored baseline; effective status is derived from submitted + dates on read:
  // pending | coming_soon | active | expired
  status: text("status").notNull().default("pending"),
  createdAt: integer("created_at").notNull(),
});
