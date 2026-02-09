# TODO: Fix Watch History and Admin Panel Issues

## Tasks
- [x] Move watch history tracking from trailer play to movie page load in MovieView.jsx
- [x] Rename trackWatchHistory to trackMovieView for clarity
- [x] Ensure watch history is saved when user views movie page, not just plays trailer

**Watch History Page Issues:**
- [x] Fix watch history not showing in Account page - Fixed response.status check (was checking response.success)
- [x] Check Account.jsx watch history section rendering logic - Verified condition {watchHistory.length > 0}
- [x] Verify watch history data structure matches between backend and frontend - Both use status: 'success' format

**Admin Panel Issues:**
- [x] Fix admin panel "Failed to load users" error - Added better error handling and response structure checks
- [x] Check userRoutes.js middleware order and authentication - Routes look correct
- [x] Verify API response structure in AdminPanel.jsx - Now handles both status: 'success' and success: true formats
- [ ] Test getAllUsers endpoint with authentication - Need to verify in browser
