import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { collection, getDocs, query, where, orderBy, limit, startAfter } from 'firebase/firestore'
import { db } from '../firebase.config'
import { toast } from 'react-toastify'
import Spinner from '../components/Spinner'

function Category() {
    const [listings, setListings] = useState(null);
    const [loading, setLoading] = useState(true);

    const params = useParams();

    useEffect(() => {
        const fetchListings = async () => {
            try {
                // Get reference:
                const listingRef = collection(db, 'listings');
                // Create a query:
                const q = query(
                    listingRef,
                    where("type", '==', params.categoryName),
                    orderBy('timestamp', 'desc'),
                    limit(10));

            } catch (error) {
                console.log(error);
                toast.warn("Something here!");
            }
        }
        fetchListings();
    });

    return (
        <div>

        </div>
    )
}

export default Category