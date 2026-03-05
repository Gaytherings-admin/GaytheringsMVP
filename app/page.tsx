"use client";

import styles from "./page.module.css";
import Link from "next/link";
import { useState, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import EditItemModal from "./components/EditItemModal";
import ProfileCompletionModal from "./components/ProfileCompletionModal";
import { ADMIN_USER_IDS } from "../config";

// Helper function to fetch collection items
async function getCollectionItems() {
  const res = await fetch(`/api/collection`, { 
    cache: "no-store",
    headers: {
      'Content-Type': 'application/json',
    }
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch collection items: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// Helper function to format dates consistently
function formatDate(dateString: string) {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    return "";
  }
}

// Helper function to get relative time
function getRelativeTime(dateString: string) {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks} week${diffInWeeks !== 1 ? 's' : ''} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
  } catch (error) {
    return "";
  }
}

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserWebflowId, setCurrentUserWebflowId] = useState<string | null>(null);
  const [currentUserClerkId, setCurrentUserClerkId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingFormData, setBookingFormData] = useState({
    name: '',
    email: '',
    eventDescription: '',
    ticketingPlatform: '',
    timeSlots: '',
    ndaSigned: false
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await fetch('/api/current-user-webflow', {
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        let userWebflowId: string | null = null;
        let userClerkId: string | null = null;
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          userWebflowId = userData.webflowUserId;
          userClerkId = userData.clerkUserId;
          setCurrentUserWebflowId(userWebflowId);
          setCurrentUserClerkId(userClerkId);
          
          // Check if user is an admin
          if (userClerkId && ADMIN_USER_IDS.includes(userClerkId)) {
            setIsAdmin(true);
          }

          // Check if user needs to complete profile
          if (userWebflowId) {
            const usersResponse = await fetch('/api/users');
            if (usersResponse.ok) {
              const usersData = await usersResponse.json();
              const currentUser = usersData.items?.find((u: any) => u.id === userWebflowId);
              
              // Show modal if full-name is empty or missing
              if (currentUser && !currentUser.fieldData?.['full-name']) {
                setNeedsProfileCompletion(true);
                setShowProfileModal(true);
              }
            }
          }
        }

        const result = await getCollectionItems();
        setData(result);
      } catch (error) {
        setData({ items: [] });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const syncUser = async () => {
      try {
        await fetch('/api/sync-user', { method: 'POST' });
        
        const userResponse = await fetch('/api/current-user-webflow', {
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.webflowUserId) {
            setCurrentUserWebflowId(userData.webflowUserId);
          }
          if (userData.clerkUserId) {
            setCurrentUserClerkId(userData.clerkUserId);
            if (ADMIN_USER_IDS.includes(userData.clerkUserId)) {
              setIsAdmin(true);
            }
          }
        }
      } catch (error) {
        // Silently fail - user sync is non-critical
      }
    };

    syncUser();
  }, []);

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleSave = (updatedItem: any) => {
    setData((prev: any) => ({
      ...prev,
      items: prev.items.map((item: any) =>
        item.id === updatedItem.id ? updatedItem : item
      ),
    }));
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.apiData}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '3rem 2rem',
              background: 'linear-gradient(135deg, rgba(110, 86, 207, 0.1) 0%, rgba(110, 86, 207, 0.05) 100%)',
              borderRadius: '16px',
              border: '2px solid rgba(110, 86, 207, 0.3)',
              boxShadow: '0 8px 24px rgba(110, 86, 207, 0.2)',
              margin: '2rem auto',
              maxWidth: '600px',
              textAlign: 'center'
            }}>
              <div style={{ 
                fontSize: '2rem',
                marginBottom: '1rem',
                animation: 'spin 1s linear infinite'
              }}>⏳</div>
              <h3 style={{ 
                color: 'var(--text-primary)', 
                fontSize: '1.5rem', 
                fontWeight: '700',
                marginBottom: '1rem'
              }}>
                Loading Your Events
              </h3>
              <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '1.1rem',
                marginBottom: '0',
                lineHeight: '1.6'
              }}>
                This may take a moment if it's your first visit
              </p>
            </div>
          </div>
        </main>
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.page}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '50vh',
          gap: '1rem'
        }}>
          <div style={{ fontSize: '3rem' }}>❌</div>
          <h3 style={{ color: '#ef4444', margin: 0 }}>Error Loading Data</h3>
          <p style={{ color: '#666', textAlign: 'center', maxWidth: '400px' }}>
            There was an issue loading your events. Please check your internet connection and try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              padding: '0.75rem 1.5rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            🔄 Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Filter events - admins see ALL events from ALL users (including drafts/archived)
  // Regular users see only their own events (including drafts/archived)
  const userEvents = isAdmin 
    ? (data?.items || [])
    : (data?.items?.filter((item: any) => {
        if (!currentUserWebflowId) {
          return false;
        }
        
        const organiserField = item.fieldData?.['organiser-name'];
        
        if (Array.isArray(organiserField)) {
          return organiserField.includes(currentUserWebflowId);
        } else if (typeof organiserField === 'string') {
          return organiserField === currentUserWebflowId;
        } else if (organiserField === null || organiserField === undefined) {
          return false;
        }
        
        return false;
      }) || []);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {/* Profile Completion Modal */}
        {needsProfileCompletion && (
          <ProfileCompletionModal
            isOpen={showProfileModal}
            onComplete={() => {
              setShowProfileModal(false);
              setNeedsProfileCompletion(false);
              window.location.reload();
            }}
          />
        )}

        <div className={styles.apiData}>
          {/* Something Big is Coming Banner */}
          <div style={{
            background: '#10234C',
            borderRadius: '12px',
            padding: '1.5rem 2rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',            
            border: 'none'
          }}>
            <div style={{
              flexShrink: 0,
              marginTop: '0.125rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px'
            }}>
              <svg width="32" height="30" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                <path fillRule="evenodd" clipRule="evenodd" d="M6.58111 0.821876L6.55879 0.875508L5.09546 4.3938C5.04938 4.5046 4.94517 4.5803 4.82557 4.58989L1.02727 4.8944L0.969364 4.89904L0.615722 4.92739L0.294879 4.95312C0.0111508 4.97586 -0.103897 5.32994 0.112275 5.51511L0.356724 5.72451L0.626164 5.95532L0.670282 5.99311L3.56418 8.47204C3.65531 8.5501 3.69511 8.6726 3.66726 8.78931L2.78313 12.4958L2.76965 12.5523L2.68734 12.8974L2.61265 13.2105C2.54661 13.4874 2.84781 13.7062 3.09072 13.5579L3.36541 13.3901L3.66817 13.2051L3.71775 13.1748L6.96962 11.1886C7.07202 11.1261 7.20082 11.1261 7.30322 11.1886L10.5551 13.1748L10.6047 13.2051L10.9075 13.3901L11.1822 13.5579C11.425 13.7062 11.7263 13.4874 11.6602 13.2105L11.5855 12.8974L11.5032 12.5523L11.4897 12.4958L10.6056 8.78931C10.5778 8.6726 10.6176 8.5501 10.7087 8.47204L13.6025 5.99311L13.6467 5.95532L13.9161 5.72451L14.1606 5.51511C14.3767 5.32994 14.2617 4.97586 13.978 4.95312L13.6571 4.92739L13.3034 4.89904L13.2456 4.8944L9.44727 4.58989C9.32767 4.5803 9.22347 4.5046 9.17739 4.3938L7.71405 0.875508L7.69174 0.821876L7.5555 0.494302L7.43188 0.19711C7.32257 -0.0657035 6.95027 -0.0657035 6.84096 0.19711L6.71735 0.494302L6.58111 0.821876ZM7.13643 2.26429L6.08033 4.80343C5.88064 5.28355 5.42913 5.61159 4.9108 5.65315L2.16958 5.87291L4.2581 7.66195C4.65301 8.00023 4.82547 8.53102 4.70482 9.03681L4.06675 11.7118L6.41362 10.2783C6.85738 10.0073 7.41548 10.0073 7.85923 10.2783L10.206 11.7118L9.56802 9.03681C9.44737 8.53102 9.61983 8.00023 10.0147 7.66195L12.1032 5.87291L9.36204 5.65315C8.84371 5.61159 8.3922 5.28355 8.19251 4.80343L7.13643 2.26429Z" fill="#7CD3FF" fillOpacity="0.937255"/>
              </svg>
            </div>
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#ffffff',
                lineHeight: '1.4'
              }}>
                Something big is coming to Gaytherings.
              </h3>
              <p style={{
                margin: 0,
                fontSize: '0.95rem',
                color: '#ffffff',
                lineHeight: '1.6',
                opacity: 0.95
              }}>
                We're building the next chapter of Gaytherings and it changes how organizers grow. Book an intro call to see what's coming, share how you run your events, and position yourself to win from day one. Early partners receive added visibility, ad credits and launch benefits. No commitment.
              </p>
              <div style={{
                marginTop: '0.5rem'
              }}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowBookingModal(true);
                  }}
                  style={{
                    display: 'inline-block',
                    padding: '0.75rem 1.5rem',
                    background: '#5ECAF5',
                    color: '#1B2024',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  Book a call
                </a>
              </div>
            </div>
          </div>

          <div style={{ 
            marginBottom: '2rem',
            paddingTop: '1rem',
            paddingBottom: '1.5rem',
            borderBottom: '2px solid rgba(110, 86, 207, 0.3)'
          }}>
            <h4 style={{ 
              fontSize: '2.25rem', 
              fontWeight: '700',
              margin: '0 0 0.75rem 0',
              color: '#ffffff',
              textAlign: 'center'
            }}>
              {isAdmin ? '🔑 Admin View - All Events' : 'My Events'}
            </h4>
            <p style={{ 
              color: '#a0a3bd', 
              fontSize: '1rem', 
              margin: 0,
              background: isAdmin ? 'rgba(239, 68, 68, 0.2)' : 'rgba(110, 86, 207, 0.1)',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              width: '100%',
              textAlign: 'center',
              border: isAdmin ? '1px solid rgba(239, 68, 68, 0.4)' : 'none'
            }}>
              {isAdmin 
                ? '👑 Admin Access: Viewing all events from all users (Pending Approval, Approved, and Offline)' 
                : '📊 Showing all events you\'ve created (Pending Approval, Approved, and Offline)'}
            </p>
          </div>
          <div className={styles.items}>
            {userEvents.map((item: any) => (
              <div
                key={item.id}
                className={styles.item}
                onClick={() => handleItemClick(item)}
                style={{ cursor: "pointer" }}
              >
                <h6 style={{ 
                  color: '#ffffff', 
                  fontSize: '1.35rem',
                  marginBottom: '1rem',
                  borderBottom: '2px solid rgba(110, 86, 207, 0.3)',
                  paddingBottom: '0.75rem'
                }}>
                  {item.fieldData?.name ||
                    item.name ||
                    item.displayName ||
                    "Untitled Event"}
                </h6>

                {item.fieldData?.description && (
                  <p style={{ color: '#d1d5db', lineHeight: '1.6' }}>
                    <strong style={{ color: '#ffffff' }}>Description:</strong> {item.fieldData.description}
                  </p>
                )}

                {item.fieldData?.['club-name'] && (
                  <p style={{ color: '#d1d5db' }}>
                    <strong style={{ color: '#ffffff' }}>Club:</strong> {item.fieldData['club-name']}
                  </p>
                )}

                {item.fieldData?.['date-and-time'] && (
                  <p style={{ color: '#d1d5db' }}>
                    <strong style={{ color: '#ffffff' }}>📅 Date:</strong> {new Date(item.fieldData['date-and-time']).toLocaleString()}
                  </p>
                )}

                {item.fieldData?.address && (
                  <p style={{ color: '#d1d5db' }}>
                    <strong style={{ color: '#ffffff' }}>📍 Address:</strong> {item.fieldData.address}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  {item.fieldData?.thumbnail && (
                    <span className={styles.statusBadge} style={{ background: 'rgba(110, 86, 207, 0.2)', color: '#b89eff', border: '1px solid rgba(110, 86, 207, 0.4)' }}>
                      🖼️ Has Thumbnail
                    </span>
                  )}
                </div>

                {item.fieldData?.['ticket-link'] && (
                  <p><strong>🎟️ Tickets:</strong> <a href={item.fieldData['ticket-link']} target="_blank" rel="noopener noreferrer" style={{ color: '#6E56CF', fontWeight: '600', textDecoration: 'underline' }}>Get Tickets</a></p>
                )}

                {typeof item.isDraft !== 'undefined' && (
                  <p className={styles.readyStatus}>
                    <strong>Status:</strong>
                    <span
                      className={styles.statusBadge}
                      style={{
                        background: item.isDraft ? 'rgba(251, 191, 36, 0.2)' : 'rgba(110, 86, 207, 0.2)',
                        color: item.isDraft ? '#fbbf24' : '#b89eff',
                        border: `1px solid ${item.isDraft ? 'rgba(251, 191, 36, 0.4)' : 'rgba(110, 86, 207, 0.4)'}`
                      }}
                    >
                      {item.isDraft ? "⏳ Pending for Approval" : "✅ Approved"}
                    </span>
                  </p>
                )}

                {typeof item.isArchived !== 'undefined' && (
                  <p className={styles.readyStatus}>
                    <strong>Visibility:</strong>
                    <span
                      className={styles.statusBadge}
                      style={{
                        background: item.isArchived ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                        color: item.isArchived ? '#fca5a5' : '#86efac',
                        border: `1px solid ${item.isArchived ? 'rgba(239, 68, 68, 0.4)' : 'rgba(34, 197, 94, 0.4)'}`
                      }}
                    >
                      {item.isArchived ? "🔴 Offline" : "✅ Live"}
                    </span>
                  </p>
                )}

                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  {item.lastPublished && (
                    <div className={styles.dateBadgeContainer}>
                      <span className={styles.dateBadge} style={{ background: 'rgba(110, 86, 207, 0.8)', color: 'white' }}>
                        📅 Approved
                      </span>
                      <span className={styles.relativeTime} style={{ color: '#a0a3bd' }}>
                        {getRelativeTime(item.lastPublished)}
                      </span>
                    </div>
                  )}
                  {item.lastUpdated && (
                    <div className={styles.dateBadgeContainer}>
                      <span className={styles.dateBadge} style={{ background: 'rgba(110, 86, 207, 0.6)', color: 'white' }}>
                        🔄 Updated
                      </span>
                      <span className={styles.relativeTime} style={{ color: '#a0a3bd' }}>
                        {getRelativeTime(item.lastUpdated)}
                      </span>
                    </div>
                  )}
                  {item.createdOn && (
                    <div className={styles.dateBadgeContainer}>
                      <span className={styles.dateBadge} style={{ background: 'rgba(110, 86, 207, 0.4)', color: 'white' }}>
                        ✨ Created
                      </span>
                      <span className={styles.relativeTime} style={{ color: '#a0a3bd' }}>
                        {getRelativeTime(item.createdOn)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {userEvents.length === 0 && !isLoading && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '3rem 2rem',
              background: 'linear-gradient(135deg, rgba(110, 86, 207, 0.1) 0%, rgba(110, 86, 207, 0.05) 100%)',
              borderRadius: '16px',
              border: '2px solid rgba(110, 86, 207, 0.3)',
              boxShadow: '0 8px 24px rgba(110, 86, 207, 0.2)',
              margin: '2rem auto',
              maxWidth: '600px',
              textAlign: 'center'
            }}>
              <h3 style={{ 
                color: 'var(--text-primary)', 
                fontSize: '1.5rem', 
                fontWeight: '700',
                marginBottom: '1rem'
              }}>
                No Events
              </h3>
              <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '1.1rem',
                marginBottom: '1.5rem',
                lineHeight: '1.6'
              }}>
                You haven't created any events yet. Get started by adding your first event!
              </p>
              <a 
                href="/addevents"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1rem 2rem',
                  background: 'linear-gradient(135deg, #6E56CF 0%, #8b73e0 100%)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(110, 86, 207, 0.4)',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(110, 86, 207, 0.5)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(110, 86, 207, 0.4)';
                }}
              >
                Add Your First Event
              </a>
            </div>
          )}
        </div>

        {selectedItem && (
          <EditItemModal
            item={selectedItem}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedItem(null);
            }}
            onSave={handleSave}
            isAdmin={isAdmin}
          />
        )}

        {/* Booking Call Modal */}
        {showBookingModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem'
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowBookingModal(false);
              }
            }}
          >
            <div
              style={{
                background: '#1a1825',
                borderRadius: '16px',
                padding: '0',
                maxWidth: '804px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '2rem 2rem 0rem 2rem'               
              }}>
                <h2 style={{
                  margin: 0,
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#ffffff'
                }}>
                  Book a 1-hour intro call
                </h2>
                <button
                  onClick={() => setShowBookingModal(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    transition: 'background 0.2s ease',
                    width: '32px',
                    height: '32px'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  ×
                </button>
              </div>

              {/* Modal Body */}
              <div style={{
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <p style={{
                  fontSize: '1.25rem',
                  fontWeight: '200',
                  color: '#ffffff',
                  lineHeight: '1.4'
                }}>We’re building something that will reshape how LGBTQ+ organizers grow on Gaytherings. Share a few details about your events and pick a time to see what’s coming.</p>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSubmittingBooking(true);
                  
                  try {
                    const response = await fetch('/api/booking', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(bookingFormData),
                    });

                    const result = await response.json();

                    if (response.ok) {
                      alert('Booking request submitted successfully! We will contact you soon.');
                      // Reset form
                      setBookingFormData({
                        name: '',
                        email: '',
                        eventDescription: '',
                        ticketingPlatform: '',
                        timeSlots: '',
                        ndaSigned: false
                      });
                      setShowBookingModal(false);
                    } else {
                      alert(`Error: ${result.error || 'Failed to submit booking request'}`);
                    }
                  } catch (error) {
                    console.error('Error submitting booking:', error);
                    alert('Failed to submit booking request. Please try again.');
                  } finally {
                    setIsSubmittingBooking(false);
                  }
                }}>
                  {/* Your name */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <input
                      type="text"
                      required
                      value={bookingFormData.name}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '0.95rem',
                        boxSizing: 'border-box',
                        outline: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2563eb';
                        e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                      }}
                      placeholder="Your name *"
                    />
                  </div>

                  {/* Email address */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <input
                      type="email"
                      required
                      value={bookingFormData.email}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '0.95rem',
                        boxSizing: 'border-box',
                        outline: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2563eb';
                        e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                      }}
                      placeholder="Email address *"
                    />
                  </div>

                  {/* Briefly describe your events */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <textarea
                      required
                      value={bookingFormData.eventDescription}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, eventDescription: e.target.value })}
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '0.95rem',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box',
                        outline: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2563eb';
                        e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                      }}
                      placeholder="Briefly describe your events * What you run, where, how often, avg attendance, registrations"
                    />
                  </div>

                  {/* Current ticketing platform */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <input
                      type="text"
                      required
                      value={bookingFormData.ticketingPlatform}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, ticketingPlatform: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '0.95rem',
                        boxSizing: 'border-box',
                        outline: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2563eb';
                        e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                      }}
                      placeholder="Current ticketing platform *"
                    />
                  </div>

                  {/* Select up to 3 time slots */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <input
                      type="text"
                      value={bookingFormData.timeSlots}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, timeSlots: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '0.95rem',
                        boxSizing: 'border-box',
                        outline: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2563eb';
                        e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                      }}
                      placeholder="Select up to 3 time slots for the call. We'll confirm one by email."
                    />
                  </div>

                  {/* Review & sign NDA */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{
                      margin: 0,
                      fontSize: '0.95rem',
                      color: '#ffffff',
                      lineHeight: '1.5'
                    }}>
                      Review & sign NDA:{' '}
                      <a
                        href="https://app.countersign.com/create/RHWHCNV4y9b3Wa__B_R1FW4upgAQrw0X-5f3NlA59HA"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#5ECAF5',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          fontWeight: '600'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.color = '#7CD3FF';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.color = '#5ECAF5';
                        }}
                      >
                        Gaytherings NDA
                      </a>
                    </p>
                  </div>

                  {/* NDA Checkbox */}
                  <div style={{ marginBottom: '2rem' }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        required
                        checked={bookingFormData.ndaSigned}
                        onChange={(e) => setBookingFormData({ ...bookingFormData, ndaSigned: e.target.checked })}
                        style={{
                          marginRight: '0.75rem',
                          marginTop: '0.25rem',
                          cursor: 'pointer',
                          width: '18px',
                          height: '18px'
                        }}
                      />
                      <span style={{
                        color: '#ffffff',
                        fontSize: '0.95rem',
                        lineHeight: '1.5'
                      }}>
                        I have reviewed and signed the NDA
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmittingBooking}
                    style={{
                      width: '100%',
                      padding: '1rem 2rem',
                      background: isSubmittingBooking ? '#64748b' : '#7355D6',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: isSubmittingBooking ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isSubmittingBooking ? 'none' : '0 4px 12px rgba(37, 99, 235, 0.3)',
                      opacity: isSubmittingBooking ? 0.7 : 1
                    }}
                    onMouseOver={(e) => {
                      if (!isSubmittingBooking) {
                        e.currentTarget.style.background = '#1d4ed8';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isSubmittingBooking) {
                        e.currentTarget.style.background = '#7355D6';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    {isSubmittingBooking ? 'Submitting...' : 'Book call'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}


      </main>
    </div>
  );
}

