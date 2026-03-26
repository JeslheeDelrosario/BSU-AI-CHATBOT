#!/bin/bash

# Consultation Notifications - Testing Script
# This script tests the complete notification flow

# Configuration
API_URL="http://localhost:5000/api"
ADMIN_TOKEN="YOUR_ADMIN_TOKEN_HERE"
STUDENT_TOKEN="YOUR_STUDENT_TOKEN_HERE"
FACULTY_TOKEN="YOUR_FACULTY_TOKEN_HERE"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Consultation Notifications Testing ===${NC}\n"

# Step 1: Check Faculty Link Status
echo -e "${YELLOW}Step 1: Checking Faculty Link Status...${NC}"
curl -X GET "$API_URL/admin/faculty/link-status" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n${YELLOW}Step 2: Auto-linking Faculty by Email...${NC}"
curl -X POST "$API_URL/admin/faculty/auto-link-by-email" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n${YELLOW}Step 3: Verifying Link Status After Auto-Link...${NC}"
curl -X GET "$API_URL/admin/faculty/link-status" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" | jq '.'

# Step 4: Get Faculty List
echo -e "\n${YELLOW}Step 4: Getting Faculty List...${NC}"
FACULTY_RESPONSE=$(curl -s -X GET "$API_URL/consultations/faculty-list" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json")

echo "$FACULTY_RESPONSE" | jq '.'

# Extract first faculty ID
FACULTY_ID=$(echo "$FACULTY_RESPONSE" | jq -r '.[0].id')
echo -e "${GREEN}Using Faculty ID: $FACULTY_ID${NC}"

# Step 5: Book a Consultation
echo -e "\n${YELLOW}Step 5: Booking a Consultation...${NC}"
BOOKING_DATE=$(date -d "+1 day" +%Y-%m-%d)
BOOKING_RESPONSE=$(curl -s -X POST "$API_URL/consultations/book" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"facultyId\": \"$FACULTY_ID\",
    \"date\": \"$BOOKING_DATE\",
    \"startTime\": \"10:00\",
    \"endTime\": \"10:15\",
    \"topic\": \"Test Consultation Topic\",
    \"notes\": \"Testing notification system\"
  }")

echo "$BOOKING_RESPONSE" | jq '.'

# Extract booking ID
BOOKING_ID=$(echo "$BOOKING_RESPONSE" | jq -r '.booking.id')
echo -e "${GREEN}Booking ID: $BOOKING_ID${NC}"

# Step 6: Check Faculty Notifications
echo -e "\n${YELLOW}Step 6: Checking Faculty Notifications (should see 📩)...${NC}"
curl -s -X GET "$API_URL/notifications?limit=10" \
  -H "Authorization: Bearer $FACULTY_TOKEN" \
  -H "Content-Type: application/json" | jq '.notifications[] | {type, title, message, isRead}'

# Step 7: Confirm Booking
echo -e "\n${YELLOW}Step 7: Faculty Confirming Booking...${NC}"
CONFIRM_RESPONSE=$(curl -s -X PUT "$API_URL/consultations/$BOOKING_ID/status" \
  -H "Authorization: Bearer $FACULTY_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"status\": \"CONFIRMED\",
    \"meetingLink\": \"https://meet.google.com/test-meeting\",
    \"location\": \"Room 101\"
  }")

echo "$CONFIRM_RESPONSE" | jq '.'

# Step 8: Check Student Notifications
echo -e "\n${YELLOW}Step 8: Checking Student Notifications (should see ✅)...${NC}"
curl -s -X GET "$API_URL/notifications?limit=10" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" | jq '.notifications[] | {type, title, message, isRead}'

# Step 9: Cancel Booking
echo -e "\n${YELLOW}Step 9: Student Cancelling Booking...${NC}"
CANCEL_RESPONSE=$(curl -s -X DELETE "$API_URL/consultations/$BOOKING_ID/cancel" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json")

echo "$CANCEL_RESPONSE" | jq '.'

# Step 10: Check Faculty Notifications Again
echo -e "\n${YELLOW}Step 10: Checking Faculty Notifications (should see ❌)...${NC}"
curl -s -X GET "$API_URL/notifications?limit=10" \
  -H "Authorization: Bearer $FACULTY_TOKEN" \
  -H "Content-Type: application/json" | jq '.notifications[] | {type, title, message, isRead}'

echo -e "\n${GREEN}=== Testing Complete ===${NC}"
echo -e "${GREEN}✅ If you see notifications in steps 6, 8, and 10, the system is working!${NC}"
