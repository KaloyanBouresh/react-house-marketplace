import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { collection, getDocs, query, where, orderBy, limit, startAfter } from 'firebase/firestore'
import { db } from '../firebase.config'
import { toast } from 'react-toastify'
import Spinner from '../components/Spinner'
import ListingItem from '../components/ListingItem'

function Offers() {
    const [listings, setListings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastFetchedLising, setLastFetchedListing] = useState(null);

    // eslint-disable-next-line no-unused-vars
    const params = useParams();

    useEffect(() => {
        const fetchListings = async () => {
            try {
                // Get reference:
                const listingRef = collection(db, 'listings');
                // Create a query:
                const q = query(
                    listingRef,
                    where("offer", '==', true),
                    orderBy('timestamp', 'desc'),
                    limit(10));

                // Execute query:
                const querySnap = await getDocs(q);

                const lastVisible = querySnap.docs[querySnap.docs.length - 1];
                setLastFetchedListing(lastVisible);

                const listings = [];

                querySnap.forEach((doc) => {
                    listings.push({
                        id: doc.id,
                        data: doc.data()
                    });
                })

                setListings(listings);
                setLoading(false);
            } catch (error) {
                console.log(error);
                toast.warn("Could not get listings!");
            }
        }
        fetchListings();
    }, []);

    // Pagination / Load More
    const onFetchMoreListings = async () => {
        try {
            // Get reference:
            const listingRef = collection(db, "listings");
            // Create a query:
            const q = query(
                listingRef,
                where("offer", "==", true),
                orderBy("timestamp", "desc"),
                startAfter(lastFetchedLising),
                limit(10)
            );

            // Execute query:
            const querySnap = await getDocs(q);

            const lastVisible = querySnap.docs[querySnap.docs.length - 1];
            setLastFetchedListing(lastVisible);

            const listings = [];

            querySnap.forEach((doc) => {
                listings.push({
                    id: doc.id,
                    data: doc.data(),
                });
            });

            setListings((prevState) => [...prevState, ...listings]);
            setLoading(false);
        } catch (error) {
            console.log(error);
            toast.warn("Could not get listings!");
        }
    };

    return (
        <div className='category'>

            <header>
                <p className="pageHeader">
                    Offers
                </p>
            </header>

            {loading ?
                < Spinner /> :
                listings && listings.length > 0 ?
                    <>
                        <main>
                            <ul className="categoryListings">
                                {listings.map((listing) => (
                                    <ListingItem
                                        listing={listing.data}
                                        id={listing.id}
                                        key={listing.id}
                                    />
                                ))}
                            </ul>
                        </main>

                        <br />
                        <br />
                        {lastFetchedLising ? (
                            <p className="loadMore" onClick={onFetchMoreListings}>
                                Load More
                            </p>
                        ) :
                            <h3>That's all</h3>}
                    </>
                    :
                    <p>There are no current offers for you</p>
            }
        </div>
    )
}

export default Offers