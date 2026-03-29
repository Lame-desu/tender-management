import { PrismaClient, Role, UserStatus, BidderType, TenderCategory, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function daysAgo(n: number) { return new Date(Date.now() - n * 86400000); }
function daysFromNow(n: number) { return new Date(Date.now() + n * 86400000); }

async function main() {
  console.log("Seeding database...\n");

  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.debriefingRequest.deleteMany();
  await prisma.evaluationSummary.deleteMany();
  await prisma.evaluation.deleteMany();
  await prisma.evaluationCommitteeAssignment.deleteMany();
  await prisma.bidDocument.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.clarification.deleteMany();
  await prisma.tenderAddendum.deleteMany();
  await prisma.tender.deleteMany();
  await prisma.bidder.deleteMany();
  await prisma.procurementOfficer.deleteMany();
  await prisma.user.deleteMany();

  const pw = await bcrypt.hash("Admin@123", 12);
  const upw = await bcrypt.hash("User@123", 12);

  // ═══════════════════════════════════════════════════════════════════════════
  //  USERS
  // ═══════════════════════════════════════════════════════════════════════════

  const admin = await prisma.user.create({ data: { fullName: "System Administrator", email: "admin@tender.gov.et", password: pw, role: Role.ADMIN, status: UserStatus.ACTIVE } });

  const officer1 = await prisma.user.create({ data: { fullName: "Abebe Kebede", email: "abebe@tender.gov.et", password: upw, role: Role.PROCUREMENT_OFFICER, status: UserStatus.ACTIVE, officerProfile: { create: { department: "Procurement Department", position: "Senior Procurement Officer", organizationName: "Ministry of Finance" } } } });
  const officer2 = await prisma.user.create({ data: { fullName: "Tigist Haile", email: "tigist@tender.gov.et", password: upw, role: Role.PROCUREMENT_OFFICER, status: UserStatus.INACTIVE, officerProfile: { create: { department: "Infrastructure Division", position: "Procurement Officer", organizationName: "Ministry of Urban Development" } } } });

  const ev1 = await prisma.user.create({ data: { fullName: "Dr. Solomon Tadesse", email: "solomon@tender.gov.et", password: upw, role: Role.EVALUATOR, status: UserStatus.ACTIVE } });
  const ev2 = await prisma.user.create({ data: { fullName: "Meron Alemu", email: "meron@tender.gov.et", password: upw, role: Role.EVALUATOR, status: UserStatus.ACTIVE } });
  const ev3 = await prisma.user.create({ data: { fullName: "Dawit Gebremedhin", email: "dawit@tender.gov.et", password: upw, role: Role.EVALUATOR, status: UserStatus.ACTIVE } });
  const ev4 = await prisma.user.create({ data: { fullName: "Bethlehem Assefa", email: "bethlehem@tender.gov.et", password: upw, role: Role.EVALUATOR, status: UserStatus.INACTIVE } });

  const b1 = await prisma.user.create({ data: { fullName: "Yonas Bekele", email: "info@ethioconstruction.com", password: upw, role: Role.BIDDER, status: UserStatus.ACTIVE, bidderProfile: { create: { bidderType: BidderType.ORGANIZATION, organizationName: "Ethio Construction PLC", tinNumber: "0012345678", tradeLicenseNumber: "TL-2024-00123", contactPerson: "Yonas Bekele", phoneNumber: "+251911223344", address: "Bole Sub City, Addis Ababa" } } } });
  const b2 = await prisma.user.create({ data: { fullName: "Frehiwot Tadesse", email: "bids@addistech.com", password: upw, role: Role.BIDDER, status: UserStatus.ACTIVE, bidderProfile: { create: { bidderType: BidderType.ORGANIZATION, organizationName: "Addis Tech Solutions PLC", tinNumber: "0023456789", tradeLicenseNumber: "TL-2024-00456", contactPerson: "Frehiwot Tadesse", phoneNumber: "+251922334455", address: "Lideta Sub City, Addis Ababa" } } } });
  const b3 = await prisma.user.create({ data: { fullName: "Samuel Girma", email: "info@greenvalley.com", password: upw, role: Role.BIDDER, status: UserStatus.ACTIVE, bidderProfile: { create: { bidderType: BidderType.ORGANIZATION, organizationName: "Green Valley Trading PLC", tinNumber: "0034567890", tradeLicenseNumber: "TL-2025-00789", contactPerson: "Samuel Girma", phoneNumber: "+251933445566", address: "Yeka Sub City, Addis Ababa" } } } });
  const b4 = await prisma.user.create({ data: { fullName: "Hana Worku", email: "hana@gmail.com", password: upw, role: Role.BIDDER, status: UserStatus.ACTIVE, bidderProfile: { create: { bidderType: BidderType.INDIVIDUAL, tinNumber: "0098765432", contactPerson: "Hana Worku", phoneNumber: "+251944556677", address: "Kirkos Sub City, Addis Ababa" } } } });
  const b5 = await prisma.user.create({ data: { fullName: "Tesfaye Mamo", email: "tesfaye@gmail.com", password: upw, role: Role.BIDDER, status: UserStatus.ACTIVE, bidderProfile: { create: { bidderType: BidderType.INDIVIDUAL, tinNumber: "0087654321", contactPerson: "Tesfaye Mamo", phoneNumber: "+251955667788", address: "Arada Sub City, Addis Ababa" } } } });
  const b6 = await prisma.user.create({ data: { fullName: "Kebede Alemu", email: "kebede@gmail.com", password: upw, role: Role.BIDDER, status: UserStatus.PENDING, bidderProfile: { create: { bidderType: BidderType.INDIVIDUAL, tinNumber: "0076543210", contactPerson: "Kebede Alemu", phoneNumber: "+251966778899", address: "Gulele Sub City, Addis Ababa" } } } });
  const b7 = await prisma.user.create({ data: { fullName: "Meseret Teshome", email: "meseret@starlight.com", password: upw, role: Role.BIDDER, status: UserStatus.INACTIVE, bidderProfile: { create: { bidderType: BidderType.ORGANIZATION, organizationName: "Starlight Supplies PLC", tinNumber: "0065432109", tradeLicenseNumber: "TL-2023-00321", contactPerson: "Meseret Teshome", phoneNumber: "+251977889900", address: "Nifas Silk, Addis Ababa" } } } });

  const activeBidders = [b1, b2, b3, b4, b5];

  // ═══════════════════════════════════════════════════════════════════════════
  //  CRITERIA PRESETS
  // ═══════════════════════════════════════════════════════════════════════════

  const criteria4 = [
    { name: "Technical Approach & Methodology", weight: 30 },
    { name: "Relevant Experience", weight: 25 },
    { name: "Qualification of Key Personnel", weight: 25 },
    { name: "Work Plan & Schedule", weight: 20 },
  ] as unknown as Prisma.JsonArray;

  const criteria3 = [
    { name: "Methodology & Approach", weight: 40 },
    { name: "Team Qualifications", weight: 35 },
    { name: "Past Experience", weight: 25 },
  ] as unknown as Prisma.JsonArray;

  const secInfo = (bidderId: number) => JSON.stringify({ reference: `BG-2026-${bidderId}`, bank: "Commercial Bank of Ethiopia", amount: 100000, validityDate: "2026-12-31" });

  // ═══════════════════════════════════════════════════════════════════════════
  //  TENDER 1 — AWARDED (full lifecycle complete)
  // ═══════════════════════════════════════════════════════════════════════════

  const t1 = await prisma.tender.create({ data: {
    title: "Supply of IT Equipment and Networking Infrastructure for Regional Offices",
    description: "The Ministry of Finance invites qualified bidders to submit proposals for the supply, delivery, installation, and commissioning of IT equipment including desktop computers, servers, networking switches, UPS systems, and structured cabling for 12 regional offices across Ethiopia.",
    category: TenderCategory.GOODS, eligibilityCriteria: "Valid trade license, minimum 3 years IT supply experience, TIN certificate. Annual turnover >= ETB 5,000,000.",
    requiredDocuments: ["Company Profile", "Financial Statements (2 years)", "Trade License", "TIN Certificate", "Past Project References"],
    evaluationCriteria: criteria4, minimumTechnicalScore: 70, technicalWeight: 80, financialWeight: 20,
    bidSecurityRequired: true, bidSecurityAmount: 100000,
    publishDate: daysAgo(30), clarificationDeadline: daysAgo(20), submissionDeadline: daysAgo(15),
    status: "AWARDED", createdBy: officer1.id,
  }});

  // Addenda for t1
  await prisma.tenderAddendum.create({ data: { tenderId: t1.id, addendumNumber: 1, description: "Clarified that UPS systems must support at least 2 hours of backup power.", issuedBy: officer1.id, issuedDate: daysAgo(25) } });
  await prisma.tenderAddendum.create({ data: { tenderId: t1.id, addendumNumber: 2, description: "Extended submission deadline by 3 days due to public holiday.", newDeadline: daysAgo(15), issuedBy: officer1.id, issuedDate: daysAgo(22) } });

  // Clarifications for t1
  const cl1 = await prisma.clarification.create({ data: { tenderId: t1.id, question: "Is the 2-year warranty requirement for all equipment or only servers?", askedBy: b1.id, askedDate: daysAgo(24) } });
  await prisma.clarification.update({ where: { id: cl1.id }, data: { answer: "The 2-year warranty applies to servers, switches, and UPS. Desktops require minimum 1-year warranty.", answeredBy: officer1.id, answeredDate: daysAgo(23) } });
  const cl2 = await prisma.clarification.create({ data: { tenderId: t1.id, question: "Can we propose alternative brands to those mentioned in the specifications?", askedBy: b2.id, askedDate: daysAgo(23) } });
  await prisma.clarification.update({ where: { id: cl2.id }, data: { answer: "Yes, equivalent or superior brands are acceptable provided they meet all technical specifications.", answeredBy: officer1.id, answeredDate: daysAgo(22) } });
  await prisma.clarification.create({ data: { tenderId: t1.id, question: "Are pre-owned or refurbished equipment acceptable?", askedBy: b3.id, askedDate: daysAgo(22) } });

  // Bids for t1 — all 4 active bidders + 1 individual
  const t1bid1 = await prisma.bid.create({ data: { tenderId: t1.id, bidderId: b1.id, technicalProposal: "Ethio Construction has 10 years of IT deployment experience. We propose Cisco networking + HP servers with 3-year warranty. Team of 5 certified network engineers, 15 completed government projects.", bidAmount: 4500000, bidSecurityInfo: secInfo(b1.id), status: "SELECTED", submissionDate: daysAgo(16) } });
  const t1bid2 = await prisma.bid.create({ data: { tenderId: t1.id, bidderId: b2.id, technicalProposal: "Addis Tech offers Dell enterprise equipment with phased deployment. 8 government projects completed, partnerships with major IT vendors. Dedicated on-site support team.", bidAmount: 4200000, bidSecurityInfo: secInfo(b2.id), status: "NOT_SELECTED", submissionDate: daysAgo(16) } });
  const t1bid3 = await prisma.bid.create({ data: { tenderId: t1.id, bidderId: b3.id, technicalProposal: "Green Valley proposes Lenovo enterprise equipment with pre-deployment testing. Extended 2-year warranty with 4-hour response SLA.", bidAmount: 4800000, bidSecurityInfo: secInfo(b3.id), status: "TECHNICALLY_DISQUALIFIED", submissionDate: daysAgo(17) } });
  const t1bid4 = await prisma.bid.create({ data: { tenderId: t1.id, bidderId: b4.id, technicalProposal: "Individual consultant with 7 years experience. Mixed vendor approach for cost optimization. 4 government network projects completed.", bidAmount: 3900000, bidSecurityInfo: secInfo(b4.id), status: "NOT_SELECTED", submissionDate: daysAgo(15) } });

  // Committee for t1
  await prisma.evaluationCommitteeAssignment.createMany({ data: [
    { tenderId: t1.id, userId: ev1.id, assignedBy: officer1.id },
    { tenderId: t1.id, userId: ev2.id, assignedBy: officer1.id },
    { tenderId: t1.id, userId: ev3.id, assignedBy: officer1.id },
  ]});

  // Technical evaluations for t1 (criteria: 30, 25, 25, 20 = 100)
  const t1Scores: { bid: typeof t1bid1; scores: number[][] }[] = [
    { bid: t1bid1, scores: [[28,22,23,18],[27,21,22,17],[26,23,21,18]] }, // avg ~88.67
    { bid: t1bid2, scores: [[25,20,20,16],[24,19,21,15],[26,20,19,16]] }, // avg ~80.33
    { bid: t1bid3, scores: [[22,18,17,14],[20,16,15,13],[21,17,16,14]] }, // avg ~67.67 (DQ)
    { bid: t1bid4, scores: [[25,21,20,16],[24,20,19,15],[26,21,21,16]] }, // avg ~81.33
  ];
  const criteriaNames4 = ["Technical Approach & Methodology", "Relevant Experience", "Qualification of Key Personnel", "Work Plan & Schedule"];
  const evaluators3 = [ev1, ev2, ev3];
  for (const { bid, scores } of t1Scores) {
    for (let e = 0; e < 3; e++) {
      const cs = criteriaNames4.map((name, i) => ({ criteriaName: name, score: scores[e][i] }));
      const total = scores[e].reduce((a, b) => a + b, 0);
      await prisma.evaluation.create({ data: {
        bidId: bid.id, evaluatorId: evaluators3[e].id, evaluationType: "TECHNICAL",
        criteriaScores: cs as unknown as Prisma.JsonArray, totalScore: total,
        remarks: total >= 80 ? "Strong proposal with good experience." : total >= 70 ? "Adequate proposal." : "Below expectations in several criteria.",
      }});
    }
  }

  // Evaluation summaries for t1
  // bid1: avg tech 88.67, qualified. Financial: 3900000/4500000*100=86.67. Combined: 88.67*.8+86.67*.2=88.27
  // bid2: avg tech 80.33, qualified. Financial: 3900000/4200000*100=92.86. Combined: 80.33*.8+92.86*.2=82.84
  // bid3: avg tech 67.67, NOT qualified
  // bid4: avg tech 81.33, qualified. Financial: 3900000/3900000*100=100. Combined: 81.33*.8+100*.2=85.07
  await prisma.evaluationSummary.create({ data: { bidId: t1bid1.id, tenderId: t1.id, avgTechnicalScore: 88.67, isTechnicallyQualified: true, avgFinancialScore: 86.67, combinedScore: 88.27, rank: 1, isWinner: true } });
  await prisma.evaluationSummary.create({ data: { bidId: t1bid2.id, tenderId: t1.id, avgTechnicalScore: 80.33, isTechnicallyQualified: true, avgFinancialScore: 92.86, combinedScore: 82.84, rank: 3, isWinner: false } });
  await prisma.evaluationSummary.create({ data: { bidId: t1bid3.id, tenderId: t1.id, avgTechnicalScore: 67.67, isTechnicallyQualified: false } });
  await prisma.evaluationSummary.create({ data: { bidId: t1bid4.id, tenderId: t1.id, avgTechnicalScore: 81.33, isTechnicallyQualified: true, avgFinancialScore: 100, combinedScore: 85.07, rank: 2, isWinner: false } });

  // Debriefing for t1
  await prisma.debriefingRequest.create({ data: { bidId: t1bid2.id, bidderId: b2.id, requestDate: daysAgo(3), response: "Your bid scored well technically but was outperformed in the financial evaluation. The winning bid offered a more competitive price while maintaining strong technical qualifications. Your technical approach was solid but could benefit from more specific implementation timelines.", respondedBy: officer1.id, respondedDate: daysAgo(1) } });
  await prisma.debriefingRequest.create({ data: { bidId: t1bid4.id, bidderId: b4.id, requestDate: daysAgo(2) } });

  // ═══════════════════════════════════════════════════════════════════════════
  //  TENDER 2 — UNDER_EVALUATION (bids opened, partial tech eval)
  // ═══════════════════════════════════════════════════════════════════════════

  const t2 = await prisma.tender.create({ data: {
    title: "Construction of Rural Health Center Buildings in Oromia Region",
    description: "Construction of 5 health center buildings including civil works, electrical installations, plumbing, and medical gas systems. Each building approximately 800 sqm with outpatient department, laboratory, pharmacy, and staff quarters.",
    category: TenderCategory.WORKS, eligibilityCriteria: "Grade 1 or 2 building contractor license, completed at least 3 similar health facility projects.",
    requiredDocuments: ["Contractor License", "Equipment List", "Financial Statements", "Tax Clearance", "Project References"],
    evaluationCriteria: criteria4, minimumTechnicalScore: 70, technicalWeight: 80, financialWeight: 20,
    bidSecurityRequired: true, bidSecurityAmount: 200000,
    publishDate: daysAgo(20), clarificationDeadline: daysAgo(12), submissionDeadline: daysAgo(7),
    status: "UNDER_EVALUATION", createdBy: officer1.id,
  }});

  const t2bid1 = await prisma.bid.create({ data: { tenderId: t2.id, bidderId: b1.id, technicalProposal: "Ethio Construction has completed 20+ health facility projects. We propose using local materials where possible with international quality standards. Our team includes certified structural engineers and medical facility planners.", bidAmount: 35000000, bidSecurityInfo: secInfo(b1.id), status: "OPENED", submissionDate: daysAgo(8) } });
  const t2bid2 = await prisma.bid.create({ data: { tenderId: t2.id, bidderId: b2.id, technicalProposal: "Addis Tech brings an integrated approach combining construction with smart building management systems. 5 health facility projects completed on time and within budget.", bidAmount: 32000000, bidSecurityInfo: secInfo(b2.id), status: "OPENED", submissionDate: daysAgo(9) } });
  const t2bid3 = await prisma.bid.create({ data: { tenderId: t2.id, bidderId: b5.id, technicalProposal: "Individual contractor with 12 years experience in rural construction. Specialized in remote area logistics and community engagement during construction. 6 health center projects completed.", bidAmount: 29000000, bidSecurityInfo: secInfo(b5.id), status: "OPENED", submissionDate: daysAgo(8) } });

  // Committee for t2
  await prisma.evaluationCommitteeAssignment.createMany({ data: [
    { tenderId: t2.id, userId: ev1.id, assignedBy: officer1.id },
    { tenderId: t2.id, userId: ev2.id, assignedBy: officer1.id },
    { tenderId: t2.id, userId: ev3.id, assignedBy: officer1.id },
  ]});

  // Only ev1 and ev2 have submitted scores for t2 — ev3 hasn't yet
  for (const bid of [t2bid1, t2bid2, t2bid3]) {
    for (const ev of [ev1, ev2]) {
      const s = [
        Math.floor(Math.random() * 8) + 22,
        Math.floor(Math.random() * 6) + 19,
        Math.floor(Math.random() * 6) + 19,
        Math.floor(Math.random() * 5) + 15,
      ];
      await prisma.evaluation.create({ data: {
        bidId: bid.id, evaluatorId: ev.id, evaluationType: "TECHNICAL",
        criteriaScores: criteriaNames4.map((n, i) => ({ criteriaName: n, score: s[i] })) as unknown as Prisma.JsonArray,
        totalScore: s.reduce((a, b) => a + b, 0),
        remarks: "Evaluation in progress.",
      }});
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  TENDER 3 — PUBLISHED, deadline PASSED, awaiting bid opening
  // ═══════════════════════════════════════════════════════════════════════════

  const t3 = await prisma.tender.create({ data: {
    title: "Consulting Services for Environmental Impact Assessment of Addis Industrial Zone",
    description: "Seeking experienced environmental consulting firms to conduct a comprehensive Environmental Impact Assessment for the proposed 500-hectare Addis Industrial Zone including air quality, water resources, biodiversity, and social impact studies.",
    category: TenderCategory.CONSULTING, eligibilityCriteria: "Registered environmental consultancy with certified EIA practitioners. At least 5 EIA projects completed.",
    requiredDocuments: ["Firm Registration", "EIA Practitioner Certificates", "Past EIA Reports", "Professional Indemnity Insurance"],
    evaluationCriteria: criteria3, minimumTechnicalScore: 75, technicalWeight: 70, financialWeight: 30,
    bidSecurityRequired: false,
    publishDate: daysAgo(15), clarificationDeadline: daysAgo(5), submissionDeadline: daysAgo(2),
    status: "PUBLISHED", createdBy: officer1.id,
  }});

  await prisma.bid.create({ data: { tenderId: t3.id, bidderId: b1.id, technicalProposal: "We have 8 certified EIA practitioners on staff and have completed 12 EIA studies including 3 industrial zone assessments.", bidAmount: 2800000, status: "SUBMITTED", submissionDate: daysAgo(3) } });
  await prisma.bid.create({ data: { tenderId: t3.id, bidderId: b3.id, technicalProposal: "Green Valley Trading's environmental division has 15 years of EIA experience. Our interdisciplinary team covers air, water, ecology, and social impact.", bidAmount: 3200000, status: "SUBMITTED", submissionDate: daysAgo(4) } });
  await prisma.bid.create({ data: { tenderId: t3.id, bidderId: b5.id, technicalProposal: "Independent environmental consultant with PhD in Environmental Science. Published 10 peer-reviewed papers on industrial environmental impacts.", bidAmount: 2100000, status: "SUBMITTED", submissionDate: daysAgo(3) } });

  // ═══════════════════════════════════════════════════════════════════════════
  //  TENDER 4 — PUBLISHED, deadline FUTURE, open for bidding
  // ═══════════════════════════════════════════════════════════════════════════

  const t4 = await prisma.tender.create({ data: {
    title: "Supply and Installation of Solar Power Systems for 20 Rural Schools",
    description: "Supply, installation, and maintenance of off-grid solar power systems for 20 rural schools in SNNPR region. Each system: 5kW solar panels, battery storage, inverters, internal wiring, and LED lighting. Includes 3-year maintenance contract.",
    category: TenderCategory.GOODS, eligibilityCriteria: "Licensed solar energy installer, minimum 2 years experience, completed at least 10 solar installations.",
    requiredDocuments: ["Company Profile", "Solar Installation License", "Equipment Specifications", "Financial Statements", "References"],
    evaluationCriteria: criteria4, minimumTechnicalScore: 70, technicalWeight: 80, financialWeight: 20,
    bidSecurityRequired: true, bidSecurityAmount: 50000,
    publishDate: daysAgo(5), clarificationDeadline: daysFromNow(5), submissionDeadline: daysFromNow(12),
    status: "PUBLISHED", createdBy: officer1.id,
  }});

  // 2 bids already
  await prisma.bid.create({ data: { tenderId: t4.id, bidderId: b2.id, technicalProposal: "Addis Tech proposes high-efficiency monocrystalline panels with lithium-ion battery storage. Our solar division has installed 50+ systems nationwide.", bidAmount: 8500000, bidSecurityInfo: secInfo(b2.id), status: "SUBMITTED", submissionDate: daysAgo(2) } });
  await prisma.bid.create({ data: { tenderId: t4.id, bidderId: b4.id, technicalProposal: "Experienced solar installer proposing polycrystalline panels with deep-cycle lead-acid batteries for cost-effectiveness. 15 school solar projects completed.", bidAmount: 7200000, bidSecurityInfo: secInfo(b4.id), status: "SUBMITTED", submissionDate: daysAgo(1) } });

  // Clarifications on t4
  await prisma.clarification.create({ data: { tenderId: t4.id, question: "What is the average daily sunshine hours for the SNNPR region schools?", askedBy: b2.id, askedDate: daysAgo(3) } });
  const cl4 = await prisma.clarification.create({ data: { tenderId: t4.id, question: "Is battery replacement included in the 3-year maintenance contract?", askedBy: b4.id, askedDate: daysAgo(2) } });
  await prisma.clarification.update({ where: { id: cl4.id }, data: { answer: "Battery replacement within the warranty period is included. After warranty, the school assumes responsibility for replacement parts.", answeredBy: officer1.id, answeredDate: daysAgo(1) } });

  // Addendum on t4
  await prisma.tenderAddendum.create({ data: { tenderId: t4.id, addendumNumber: 1, description: "Added requirement for lightning protection system at each installation site.", issuedBy: officer1.id, issuedDate: daysAgo(2) } });

  // ═══════════════════════════════════════════════════════════════════════════
  //  TENDER 5 — PUBLISHED, future deadline, NO bids yet
  // ═══════════════════════════════════════════════════════════════════════════

  await prisma.tender.create({ data: {
    title: "Road Maintenance and Rehabilitation Works for Dire Dawa City Roads",
    description: "Maintenance and rehabilitation of 45km of city roads including pothole patching, asphalt overlay, drainage improvement, road marking, and traffic signage installation.",
    category: TenderCategory.WORKS, eligibilityCriteria: "Grade 1 road contractor license, minimum 5 years road maintenance experience.",
    requiredDocuments: ["Road Contractor License", "Equipment Inventory", "Past Project Certificates", "Financial Capability Proof"],
    evaluationCriteria: criteria3, minimumTechnicalScore: 70, technicalWeight: 75, financialWeight: 25,
    bidSecurityRequired: true, bidSecurityAmount: 150000,
    publishDate: daysAgo(3), clarificationDeadline: daysFromNow(10), submissionDeadline: daysFromNow(20),
    status: "PUBLISHED", createdBy: officer1.id,
  }});

  // ═══════════════════════════════════════════════════════════════════════════
  //  TENDER 6 — DRAFT
  // ═══════════════════════════════════════════════════════════════════════════

  await prisma.tender.create({ data: {
    title: "Feasibility Study for Addis Ababa Light Rail Extension",
    description: "Comprehensive feasibility study for the proposed 15km extension of the Addis Ababa Light Rail Transit system to the eastern suburbs including demand analysis, route planning, cost estimation, and financial modeling.",
    category: TenderCategory.CONSULTING, eligibilityCriteria: "International or local consulting firm with urban transit planning experience.",
    requiredDocuments: ["Firm Profile", "Key Personnel CVs", "Past Transit Studies", "Financial Proposal"],
    evaluationCriteria: criteria3, minimumTechnicalScore: 75, technicalWeight: 70, financialWeight: 30,
    bidSecurityRequired: false,
    clarificationDeadline: daysFromNow(30), submissionDeadline: daysFromNow(45),
    status: "DRAFT", createdBy: officer1.id,
  }});

  // ═══════════════════════════════════════════════════════════════════════════
  //  TENDER 7 — CANCELLED
  // ═══════════════════════════════════════════════════════════════════════════

  await prisma.tender.create({ data: {
    title: "Supply of Medical Laboratory Equipment for Regional Hospitals",
    description: "Procurement of automated hematology analyzers, chemistry analyzers, microscopes, and related consumables for 8 regional hospitals. This tender was cancelled due to budget reallocation.",
    category: TenderCategory.GOODS, eligibilityCriteria: "Authorized medical equipment dealer with after-sales service capability.",
    requiredDocuments: ["Dealership Certificate", "Equipment Specifications", "Service Center Details"],
    evaluationCriteria: criteria4, minimumTechnicalScore: 70, technicalWeight: 80, financialWeight: 20,
    bidSecurityRequired: true, bidSecurityAmount: 75000,
    publishDate: daysAgo(40), clarificationDeadline: daysAgo(32), submissionDeadline: daysAgo(25),
    status: "CANCELLED", createdBy: officer1.id,
  }});

  // ═══════════════════════════════════════════════════════════════════════════
  //  NOTIFICATIONS (mix of read/unread for multiple users)
  // ═══════════════════════════════════════════════════════════════════════════

  const notifs = [
    // Officer notifications
    { userId: officer1.id, message: "New bid submitted for: Supply of IT Equipment by Ethio Construction PLC", notificationType: "BID_SUBMITTED", entityType: "Tender", entityId: t1.id, isRead: true, sentDate: daysAgo(16) },
    { userId: officer1.id, message: "New bid submitted for: Supply of IT Equipment by Addis Tech Solutions PLC", notificationType: "BID_SUBMITTED", entityType: "Tender", entityId: t1.id, isRead: true, sentDate: daysAgo(16) },
    { userId: officer1.id, message: "New bid submitted for: Construction of Rural Health Center by Tesfaye Mamo", notificationType: "BID_SUBMITTED", entityType: "Tender", entityId: t2.id, isRead: true, sentDate: daysAgo(8) },
    { userId: officer1.id, message: "Debriefing requested for 'Supply of IT Equipment' by Addis Tech Solutions PLC", notificationType: "DEBRIEFING_REQUESTED", entityType: "DebriefingRequest", entityId: 1, isRead: true, sentDate: daysAgo(3) },
    { userId: officer1.id, message: "Debriefing requested for 'Supply of IT Equipment' by Hana Worku", notificationType: "DEBRIEFING_REQUESTED", entityType: "DebriefingRequest", entityId: 2, isRead: false, sentDate: daysAgo(2) },
    { userId: officer1.id, message: "New clarification question on: Supply and Installation of Solar Power Systems", notificationType: "CLARIFICATION_ASKED", entityType: "Tender", entityId: t4.id, isRead: false, sentDate: daysAgo(3) },
    { userId: officer1.id, message: "New bid submitted for: Solar Power Systems by Addis Tech Solutions PLC", notificationType: "BID_SUBMITTED", entityType: "Tender", entityId: t4.id, isRead: false, sentDate: daysAgo(2) },

    // Bidder1 notifications (winner)
    { userId: b1.id, message: "New tender published: Supply of IT Equipment and Networking Infrastructure", notificationType: "TENDER_PUBLISHED", entityType: "Tender", entityId: t1.id, isRead: true, sentDate: daysAgo(30) },
    { userId: b1.id, message: "Bids for Supply of IT Equipment have been opened", notificationType: "BIDS_OPENED", entityType: "Tender", entityId: t1.id, isRead: true, sentDate: daysAgo(14) },
    { userId: b1.id, message: "Congratulations! Your bid for 'Supply of IT Equipment' has been selected.", notificationType: "BID_SELECTED", entityType: "Tender", entityId: t1.id, isRead: false, sentDate: daysAgo(5) },
    { userId: b1.id, message: "New tender published: Supply and Installation of Solar Power Systems", notificationType: "TENDER_PUBLISHED", entityType: "Tender", entityId: t4.id, isRead: false, sentDate: daysAgo(5) },
    { userId: b1.id, message: "Addendum #1 issued for: Solar Power Systems", notificationType: "ADDENDUM_ISSUED", entityType: "Tender", entityId: t4.id, isRead: false, sentDate: daysAgo(2) },

    // Bidder2 notifications (loser with debriefing)
    { userId: b2.id, message: "The evaluation for 'Supply of IT Equipment' is complete. Your bid was not selected. You may request a debriefing.", notificationType: "BID_NOT_SELECTED", entityType: "Tender", entityId: t1.id, isRead: true, sentDate: daysAgo(5) },
    { userId: b2.id, message: "Your debriefing request for 'Supply of IT Equipment' has been answered.", notificationType: "DEBRIEFING_RESPONDED", entityType: "DebriefingRequest", entityId: 1, isRead: false, sentDate: daysAgo(1) },
    { userId: b2.id, message: "Your bid for Supply and Installation of Solar Power Systems has been submitted successfully", notificationType: "BID_SUBMITTED", entityType: "Bid", entityId: 1, isRead: true, sentDate: daysAgo(2) },

    // Bidder4 notifications (loser with pending debriefing)
    { userId: b4.id, message: "The evaluation for 'Supply of IT Equipment' is complete. Your bid was not selected. You may request a debriefing.", notificationType: "BID_NOT_SELECTED", entityType: "Tender", entityId: t1.id, isRead: true, sentDate: daysAgo(5) },

    // Evaluator notifications
    { userId: ev1.id, message: "You have been assigned to evaluate: Supply of IT Equipment", notificationType: "COMMITTEE_ASSIGNED", entityType: "Tender", entityId: t1.id, isRead: true, sentDate: daysAgo(14) },
    { userId: ev1.id, message: "Technical evaluation finalized for: Supply of IT Equipment. Financial evaluation can begin.", notificationType: "TECH_EVAL_FINALIZED", entityType: "Tender", entityId: t1.id, isRead: true, sentDate: daysAgo(10) },
    { userId: ev1.id, message: "You have been assigned to evaluate: Construction of Rural Health Center Buildings", notificationType: "COMMITTEE_ASSIGNED", entityType: "Tender", entityId: t2.id, isRead: false, sentDate: daysAgo(5) },
    { userId: ev2.id, message: "You have been assigned to evaluate: Construction of Rural Health Center Buildings", notificationType: "COMMITTEE_ASSIGNED", entityType: "Tender", entityId: t2.id, isRead: false, sentDate: daysAgo(5) },
    { userId: ev3.id, message: "You have been assigned to evaluate: Construction of Rural Health Center Buildings", notificationType: "COMMITTEE_ASSIGNED", entityType: "Tender", entityId: t2.id, isRead: false, sentDate: daysAgo(5) },

    // All active bidders get tender published notifications
    ...activeBidders.map(b => ({ userId: b.id, message: "New tender published: Road Maintenance and Rehabilitation Works", notificationType: "TENDER_PUBLISHED", entityType: "Tender", entityId: t3.id, isRead: false as boolean, sentDate: daysAgo(3) })),
  ];

  await prisma.notification.createMany({ data: notifs });

  // ═══════════════════════════════════════════════════════════════════════════
  //  AUDIT LOGS
  // ═══════════════════════════════════════════════════════════════════════════

  const logs = [
    { action: "User logged in", entityType: "User", entityId: admin.id, performedBy: admin.id, timestamp: daysAgo(30), ipAddress: "192.168.1.1" },
    { action: "Created user account", entityType: "User", entityId: officer1.id, performedBy: admin.id, timestamp: daysAgo(30), ipAddress: "192.168.1.1" },
    { action: "Activated user account", entityType: "User", entityId: b1.id, performedBy: admin.id, timestamp: daysAgo(30), ipAddress: "192.168.1.1" },
    { action: "Activated user account", entityType: "User", entityId: b2.id, performedBy: admin.id, timestamp: daysAgo(30), ipAddress: "192.168.1.1" },
    { action: "User logged in", entityType: "User", entityId: officer1.id, performedBy: officer1.id, timestamp: daysAgo(30), ipAddress: "10.0.0.5" },
    { action: "Created tender", entityType: "Tender", entityId: t1.id, performedBy: officer1.id, timestamp: daysAgo(30), ipAddress: "10.0.0.5" },
    { action: "Published tender", entityType: "Tender", entityId: t1.id, performedBy: officer1.id, timestamp: daysAgo(30), ipAddress: "10.0.0.5" },
    { action: "Issued addendum", entityType: "Tender", entityId: t1.id, performedBy: officer1.id, timestamp: daysAgo(25), ipAddress: "10.0.0.5" },
    { action: "Asked clarification", entityType: "Tender", entityId: t1.id, performedBy: b1.id, timestamp: daysAgo(24), ipAddress: "172.16.0.10" },
    { action: "Answered clarification", entityType: "Tender", entityId: t1.id, performedBy: officer1.id, timestamp: daysAgo(23), ipAddress: "10.0.0.5" },
    { action: "Submitted bid", entityType: "Bid", entityId: t1bid1.id, performedBy: b1.id, timestamp: daysAgo(16), ipAddress: "172.16.0.10" },
    { action: "Submitted bid", entityType: "Bid", entityId: t1bid2.id, performedBy: b2.id, timestamp: daysAgo(16), ipAddress: "172.16.0.11" },
    { action: "Submitted bid", entityType: "Bid", entityId: t1bid3.id, performedBy: b3.id, timestamp: daysAgo(17), ipAddress: "172.16.0.12" },
    { action: "Submitted bid", entityType: "Bid", entityId: t1bid4.id, performedBy: b4.id, timestamp: daysAgo(15), ipAddress: "172.16.0.13" },
    { action: "Opened bids for tender", entityType: "Tender", entityId: t1.id, performedBy: officer1.id, timestamp: daysAgo(14), ipAddress: "10.0.0.5", details: "4 bids opened" },
    { action: "Assigned evaluation committee", entityType: "Tender", entityId: t1.id, performedBy: officer1.id, timestamp: daysAgo(14), ipAddress: "10.0.0.5" },
    { action: "Submitted technical evaluation", entityType: "Tender", entityId: t1.id, performedBy: ev1.id, timestamp: daysAgo(12), ipAddress: "10.0.1.1" },
    { action: "Submitted technical evaluation", entityType: "Tender", entityId: t1.id, performedBy: ev2.id, timestamp: daysAgo(11), ipAddress: "10.0.1.2" },
    { action: "Submitted technical evaluation", entityType: "Tender", entityId: t1.id, performedBy: ev3.id, timestamp: daysAgo(10), ipAddress: "10.0.1.3" },
    { action: "Finalized technical evaluation", entityType: "Tender", entityId: t1.id, performedBy: officer1.id, timestamp: daysAgo(10), ipAddress: "10.0.0.5" },
    { action: "Finalized financial evaluation", entityType: "Tender", entityId: t1.id, performedBy: officer1.id, timestamp: daysAgo(8), ipAddress: "10.0.0.5" },
    { action: "Awarded tender", entityType: "Tender", entityId: t1.id, performedBy: officer1.id, timestamp: daysAgo(6), ipAddress: "10.0.0.5" },
    { action: "Published tender results", entityType: "Tender", entityId: t1.id, performedBy: officer1.id, timestamp: daysAgo(5), ipAddress: "10.0.0.5" },
    { action: "Requested debriefing", entityType: "DebriefingRequest", entityId: 1, performedBy: b2.id, timestamp: daysAgo(3), ipAddress: "172.16.0.11" },
    { action: "Responded to debriefing", entityType: "DebriefingRequest", entityId: 1, performedBy: officer1.id, timestamp: daysAgo(1), ipAddress: "10.0.0.5" },
    { action: "Created tender", entityType: "Tender", entityId: t2.id, performedBy: officer1.id, timestamp: daysAgo(20), ipAddress: "10.0.0.5" },
    { action: "Published tender", entityType: "Tender", entityId: t2.id, performedBy: officer1.id, timestamp: daysAgo(20), ipAddress: "10.0.0.5" },
    { action: "Opened bids for tender", entityType: "Tender", entityId: t2.id, performedBy: officer1.id, timestamp: daysAgo(6), ipAddress: "10.0.0.5", details: "3 bids opened" },
    { action: "Assigned evaluation committee", entityType: "Tender", entityId: t2.id, performedBy: officer1.id, timestamp: daysAgo(5), ipAddress: "10.0.0.5" },
    { action: "Submitted technical evaluation", entityType: "Tender", entityId: t2.id, performedBy: ev1.id, timestamp: daysAgo(3), ipAddress: "10.0.1.1" },
    { action: "Submitted technical evaluation", entityType: "Tender", entityId: t2.id, performedBy: ev2.id, timestamp: daysAgo(2), ipAddress: "10.0.1.2" },
    { action: "User logged in", entityType: "User", entityId: b1.id, performedBy: b1.id, timestamp: daysAgo(1), ipAddress: "172.16.0.10" },
    { action: "User logged in", entityType: "User", entityId: officer1.id, performedBy: officer1.id, timestamp: daysAgo(0), ipAddress: "10.0.0.5" },
  ];

  await prisma.auditLog.createMany({ data: logs });

  // ═══════════════════════════════════════════════════════════════════════════
  //  PRINT SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  SEED DATA CREATED SUCCESSFULLY");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("");
  console.log("  Credentials (password for all):");
  console.log("  Admin:   admin@tender.gov.et   / Admin@123");
  console.log("  All others:                     / User@123");
  console.log("");
  console.log("  Users:");
  console.log("  ─────────────────────────────────────────────────────────────");
  console.log(`  Admin        : ${admin.email} (ACTIVE)`);
  console.log(`  Officer 1    : ${officer1.email} (ACTIVE) ← main officer`);
  console.log(`  Officer 2    : ${officer2.email} (INACTIVE)`);
  console.log(`  Evaluator 1-3: solomon/meron/dawit@tender.gov.et (ACTIVE)`);
  console.log(`  Evaluator 4  : ${ev4.email} (INACTIVE)`);
  console.log(`  Bidder 1-5   : Active (3 orgs + 2 individuals)`);
  console.log(`  Bidder 6     : ${b6.email} (PENDING)`);
  console.log(`  Bidder 7     : ${b7.email} (INACTIVE)`);
  console.log("");
  console.log("  Tenders (all by Officer 1):");
  console.log("  ─────────────────────────────────────────────────────────────");
  console.log("  1. IT Equipment Supply ─────── AWARDED   (4 bids, full eval, winner+debriefings)");
  console.log("  2. Health Center Construction ─ UNDER_EVAL (3 bids opened, 2/3 evaluators done)");
  console.log("  3. Environmental Impact Study ─ PUBLISHED  (deadline PASSED, 3 bids, awaiting open)");
  console.log("  4. Solar Power for Schools ──── PUBLISHED  (deadline future, 2 bids, clarifications)");
  console.log("  5. Road Maintenance ──────────── PUBLISHED  (deadline future, 0 bids)");
  console.log("  6. Light Rail Feasibility ───── DRAFT");
  console.log("  7. Medical Lab Equipment ────── CANCELLED");
  console.log("");
  console.log("  Also seeded: 30+ notifications, 30+ audit logs, addenda, clarifications,");
  console.log("  evaluations, evaluation summaries, debriefing requests");
  console.log("═══════════════════════════════════════════════════════════════");
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error("Seed error:", e); await prisma.$disconnect(); process.exit(1); });
