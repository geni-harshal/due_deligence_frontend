// src/lib/mock-data.js
// src/lib/mock-data.js
export const mockUser = {
  id: 1,
  email: "super_admin@demo.com",
  fullName: "Super Admin",
  role: "super_admin",
  clientCompanyId: null,
  clientCompanyName: null,
  isActive: true,
};

// ... all your other mock data (clients, products, orders, users) unchanged
// (I'm not repeating everything, but keep your full file)

export const mockClients = [
  {
    id: 1,
    name: "Acme Corporation",
    legalName: "Acme Corporation Inc.",
    slug: "acme",
    registeredAddress: "123 Main Street, Suite 400",
    country: "United States",
    state: "New York",
    city: "New York",
    postalCode: "10001",
    contactPersonName: "John Doe",
    contactEmail: "john@acme.com",
    contactPhone: "+1 555-123-4567",
    contactMobile: "+1 555-987-6543",
    notes: "Key enterprise client",
    status: "active",
    createdAt: "2025-01-01T10:00:00Z",
    updatedAt: "2025-01-15T14:30:00Z",
  },
  {
    id: 2,
    name: "Beta Solutions",
    legalName: "Beta Solutions LLC",
    slug: "beta",
    registeredAddress: "456 Oak Avenue",
    country: "United States",
    state: "California",
    city: "San Francisco",
    postalCode: "94105",
    contactPersonName: "Jane Smith",
    contactEmail: "jane@beta.com",
    contactPhone: "+1 415-555-7890",
    status: "active",
    createdAt: "2025-02-10T09:15:00Z",
    updatedAt: "2025-02-10T09:15:00Z",
  },
];

export const mockProducts = [
  {
    id: 1,
    name: "Due Diligence Report",
    code: "DDR",
    description: "Comprehensive company background including financials, directors, and legal history.",
    isActive: true,
  },
  {
    id: 2,
    name: "Lien Report",
    code: "LR",
    description: "Search for charges, liens, and encumbrances.",
    isActive: true,
  },
];

export const mockEntitlements = [
  {
    id: 1,
    clientCompanyId: 1,
    clientCompanyName: "Acme Corporation",
    productId: 1,
    productName: "Due Diligence Report",
    productCode: "DDR",
    grantedAt: "2025-01-10T12:00:00Z",
  },
  {
    id: 2,
    clientCompanyId: 2,
    clientCompanyName: "Beta Solutions",
    productId: 1,
    productName: "Due Diligence Report",
    productCode: "DDR",
    grantedAt: "2025-02-11T08:30:00Z",
  },
];

export const mockOrders = [
  {
    id: 1,
    orderNumber: "DDR-2025-0001",
    clientCompanyId: 1,
    clientCompanyName: "Acme Corporation",
    productId: 1,
    productName: "Due Diligence Report",
    productCode: "DDR",
    subjectName: "TechStart Inc.",
    subjectType: "Company",
    subjectDetails: {
      cin: "U72300MH2010PTC123456",
      city: "Mumbai",
      state: "Maharashtra",
      status: "Active",
    },
    status: "in_progress",
    priority: "normal",
    notes: "Please focus on recent legal cases.",
    analystEnrichment: null,
    providerSearchSnapshot: null,
    generatedDocuments: [],
    createdAt: "2025-03-01T11:00:00Z",
    updatedAt: "2025-03-01T11:00:00Z",
    completedAt: null,
  },
  {
    id: 2,
    orderNumber: "DDR-2025-0002",
    clientCompanyId: 2,
    clientCompanyName: "Beta Solutions",
    productId: 1,
    productName: "Due Diligence Report",
    productCode: "DDR",
    subjectName: "Innovate Pvt Ltd",
    subjectType: "Company",
    subjectDetails: {
      cin: "U74999KA2015PTC987654",
      city: "Bangalore",
      state: "Karnataka",
      status: "Active",
    },
    status: "completed",
    priority: "high",
    notes: "",
    analystEnrichment: {
      investigationSummary: "The company has a clean record.",
      analystComments: "No red flags found.",
      redFlags: [],
      recommendationNotes: "Approved.",
      decisionOutputs: {
        riskScore: 15,
        rating: "A",
      },
    },
    providerSearchSnapshot: {
      rawResults: {
        companyProfile: {
          name: "Innovate Pvt Ltd",
          cin: "U74999KA2015PTC987654",
          // ... more fields
        },
      },
    },
    generatedDocuments: [
      {
        id: 1,
        documentType: "due_diligence_report",
        status: "ready",
        url: "/mock/report.pdf",
      },
    ],
    createdAt: "2025-02-25T09:30:00Z",
    updatedAt: "2025-03-02T16:20:00Z",
    completedAt: "2025-03-02T16:20:00Z",
  },
];

export const mockUsers = [
  {
    id: 2,
    email: "alice@acme.com",
    fullName: "Alice Johnson",
    role: "client_admin",
    clientCompanyId: 1,
    clientCompanyName: "Acme Corporation",
    isActive: true,
    createdAt: "2025-01-05T08:00:00Z",
  },
  {
    id: 3,
    email: "bob@beta.com",
    fullName: "Bob Williams",
    role: "client_user",
    clientCompanyId: 2,
    clientCompanyName: "Beta Solutions",
    isActive: true,
    createdAt: "2025-02-15T10:00:00Z",
  },
];