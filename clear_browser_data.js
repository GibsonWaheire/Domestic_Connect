// Clear all authentication data from localStorage
// Run this in your browser console to clear old login data

console.log('🧹 Clearing all authentication data...');

// Clear all localStorage items related to authentication
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
        key.includes('domestic_connect') ||
        key.includes('auth') ||
        key.includes('user') ||
        key.includes('session')
    )) {
        keysToRemove.push(key);
    }
}

keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`✅ Removed: ${key}`);
});

// Clear sessionStorage as well
sessionStorage.clear();
console.log('✅ Cleared sessionStorage');

console.log('🎉 All authentication data cleared!');
console.log('You can now login with the fresh credentials.');
