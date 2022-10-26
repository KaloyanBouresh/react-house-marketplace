import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase.config'
import { toast } from 'react-toastify'
import Spinner from '../components/Spinner'


function Contact() {
    const [message, setMessage] = useState('');
    const [landlord, setLandlord] = useState(null);
    const [loading, setLoading] = useState(true);
    // eslint-disable-next-line no-unused-vars
    const [searchParams, setSearchParams] = useSearchParams();

    const params = useParams();

    useEffect(() => {
        const getLandlord = async () => {
            try {
                const docRef = doc(db, 'users', params.landlordId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setLandlord(docSnap.data());
                    setLoading(false);
                } else {
                    toast.warn('Could not get landlord data')
                }
            } catch (error) {
                console.log(error);
                toast.error("Something went wrong!\nTry again later!");
            }
        };
        getLandlord();

    }, [params.landlordId]);

    const onChange = (e) => {
        e.preventDefault();
        setMessage(e.target.value)
    }

    if (loading) {
        return <Spinner />
    }

    return (
        <main>
            <div className='pageContainer'>
                <header className="pageHeader">
                    Contact Landlord
                </header>
                <main>
                    <div className="contactLandlord">
                        <p className="landlordName">Contact {landlord.name}</p>
                    </div>
                    <form className="messageForm">
                        <div className="messageDiv flex">
                            <label htmlFor="message" className='messageLabel'>Message</label>
                            <textarea
                                name="message"
                                id="message"
                                className='textarea'
                                value={message}
                                onChange={onChange}
                            ></textarea>
                        </div>

                        <a
                            href={`mailto:${ landlord.email }?Subject=${ searchParams.get('listingName') }&body=${ message }}`}
                        >
                            <button className='primaryButton' type='button'>Send Message</button>
                        </a>
                    </form>
                </main>

            </div>
        </main>
    )
}

export default Contact