import { useState, useEffect, useRef } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import Spinner from '../components/Spinner'

function CreateListing() {
    const [geolocationEnabled, setGeolocationEnabled] = useState(true);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: 'rent',
        name: '',
        bedrooms: 1,
        bathrooms: 1,
        parking: false,
        furnished: false,
        address: '',
        offer: false,
        regularPrice: 0,
        discountedPrice: 0,
        images: {},
        latitude: 0,
        longitude: 0,

    });

    const {
        type,
        name,
        bedrooms,
        bathrooms,
        parking,
        furnished,
        address,
        offer,
        regularPrice,
        discountedPrice,
        images,
        latitude,
        longitude
    } = formData;

    const auth = getAuth();
    const navigate = useNavigate();
    const isMounted = useRef(true);

    useEffect(() => {
        if (isMounted) {
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    setFormData({ ...formData, useRef: user.uid });
                }
                else {
                    navigate('/sign-in');
                }
            })
        }

        return () => {
            isMounted.current = false;
        }
    }, [isMounted])

    const onSubmit = (e) => {
        e.preventDefault();
    }

    const onMutate = (e) => {
        console.log('mutate')
    }

    if (loading) {
        return <Spinner />
    }

    return (
        <div className="prifile">
            <header>
                <p className="pageHeader">Create a Listing</p>
            </header>

            <main>
                <form onSubmit={onSubmit}>
                    <label className="formLabel">Sell / Rent</label>
                    <div className="formButtons">
                        <button type='button'
                            className={type === 'sale' ? 'formButtonActive' : 'formButton'}
                            id='type'
                            value='sale'
                            onClick={onMutate}>
                            Sell
                        </button>
                        <button type='button'
                            className={type === 'rent' ? 'formButtonActive' : 'formButton'}
                            id='type'
                            value='rent'
                            onClick={onMutate}>
                            Rent
                        </button>
                    </div>

                    <label className="formLabel">Name</label>
                    <input type="text"
                        className="formInputName"
                        value={name}
                        id='name'
                        onChange={onMutate}
                        maxLength='40'
                        minLength='10'
                        required
                    />

                    <div className="formRooms flex">
                        <div>
                            <label className="formLabel">Bedrooms</label>
                            <input
                                type="number"
                                className="formInputSmall"
                                value={bedrooms}
                                id='bedrooms'
                                onChange={onMutate}
                                min='1'
                                max='50'
                                required
                            />
                        </div>
                        <div>
                            <label className="formLabel">Bathrooms</label>
                            <input
                                type="number"
                                className="formInputSmall"
                                value={bathrooms}
                                id='bathrooms'
                                onChange={onMutate}
                                min='1'
                                max='50'
                                required
                            />
                        </div>
                    </div>

                    <label className="formLabel">Parking spot</label>
                    <div className="formButtons">
                        <button
                            type='button'
                            className={parking ? 'formButtonActive' : 'formButton'}
                            id='parking'
                            value={true}
                            onClick={onMutate}
                            min='1'
                            max='50'
                        >
                            Yes
                        </button>
                        <button
                            type='button'
                            className={!parking && parking !== null ? 'formButtonActive' : 'formButton'}
                            id='parking'
                            value={false}
                            onClick={onMutate}
                        >
                            No
                        </button>
                    </div>

                    <label className="formLabel">Furnished</label>
                    <div className="formButtons">
                        <button
                            type='button'
                            className={furnished ? 'formButtonActive' : 'formButton'}
                            id='furnished'
                            value={true}
                            onClick={onMutate}
                            min='1'
                            max='50'
                        >
                            Yes
                        </button>
                        <button
                            type='button'
                            className={!furnished && furnished !== null ? 'formButtonActive' : 'formButton'}
                            id='furnished'
                            value={false}
                            onClick={onMutate}
                        >
                            No
                        </button>
                    </div>

                    <label className="formLabel">Adress</label>
                    <input type="text"
                        className="formInputAddress"
                        value={address}
                        id='address'
                        onChange={onMutate}
                        required
                    />

                    {/* Show if geolocation is not enabled: */}
                    {!geolocationEnabled && (
                        <div className="formLatLng flex">
                            <div>
                                <label className="formLabel"> Latitude</label>
                                <input
                                    type="number"
                                    className="formInputSmall"
                                    id='latitiude'
                                    value={latitude}
                                    onChange={onMutate}
                                    required
                                />
                            </div>
                            <div>
                                <label className="formLabel"> Longitude</label>
                                <input
                                    type="number"
                                    className="formInputSmall"
                                    id='longitude'
                                    value={longitude}
                                    onChange={onMutate}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <label className="formLabel">Offer</label>
                    <div className="formButtons">
                        <button
                            type='button'
                            className={offer ? 'formButtonActive' : 'formButton'}
                            id='offer'
                            value={true}
                            onClick={onMutate}
                        >
                            Yes
                        </button>
                        <button
                            type='button'
                            className={!offer && offer !== null ? 'formButtonActive' : 'formButton'}
                            id='offer'
                            value={false}
                            onClick={onMutate}
                        >
                            No
                        </button>
                    </div>

                    <label className="formLabel">Regular Price</label>
                    <div className="formPriceDiv">
                        <input
                            type="number"
                            className="formInputSmall"
                            id='regularPrice'
                            value={regularPrice}
                            onChange={onMutate}
                            min='50'
                            max='750000000'
                            required
                        />
                        {type === 'rent' && (
                            <p className='formPriceText'>$ / Month</p>
                        )}
                    </div>

                    {/* If offer is true */}
                    {offer && (
                        <>
                            <label className="formLabel">Discounted Price</label>
                            <input
                                type="number"
                                className="formInputSmall"
                                id='discountedPrice'
                                value={discountedPrice}
                                onChange={onMutate}
                                min='50'
                                max='750000000'
                                required={offer}
                            />
                        </>
                    )}

                    <label className="formLabel">Images</label>
                    <p className="imagesInfo">The first image will be the cover (max 6).</p>
                    <input
                        type="file"
                        className="formInputFile"
                        id='images'
                        onChange={onMutate}
                        max='6'
                        accept='.jpg, .png, .jpeg'
                        multiple
                        required
                    />
                    <button type='submit' className="primaryButton createListingButton">Create Listing</button>
                </form>
            </main>
        </div >
    )
}

export default CreateListing