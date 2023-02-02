import { useEffect, useState } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { getDoc, doc } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { db } from "../firebase.config"
import Spinner from "../components/Spinner"
import shareIcon from "../assets/svg/shareIcon.svg"
import { toast } from "react-toastify"
import { MapContainer, Popup, TileLayer, Marker } from 'react-leaflet'
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/swiper-bundle.css'
SwiperCore.use([Navigation, Pagination, Scrollbar, A11y])

function Listing() {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  const navigate = useNavigate();
  const params = useParams();
  const auth = getAuth();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const docRef = doc(db, 'listings', params.listingId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setListing(docSnap.data());
          setLoading(false);
        }
      } catch (error) {
        toast.error("Something went wrong!\nTry again later!");
        console.log(error);
      }
    };
    fetchListing();
  }, [navigate, params.listingId]);

  const onShareClick = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareLinkCopied(true);
    setTimeout(() => {
      setShareLinkCopied(false);
    }, 2000)
    console.log('clicked shared function');
  }

  if (loading) {
    return <Spinner />
  }

  return (
    <main>

      <Swiper
        slidesPerView={1}
        pagination={{ clickable: true }}>

        {listing.imgUrls.map((url, index) => (
          <SwiperSlide key={index}>
            <div
              className="swiperSlideDiv"
              style={{
                background: `url(${ listing.imgUrls[index] }) center no-repeat`,
                backgroundSize: 'cover'
              }}>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="shareIconDiv" onClick={onShareClick}>
        <img src={shareIcon} alt="shareIcon" />
      </div>

      {shareLinkCopied && <p className="linkCopied">Link Copied</p>}

      <div className="listingDetails">
        <p className="listingName">{listing.name} -
          ${listing.offer ? listing.discountedPrice
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ',') : listing.regularPrice
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        </p>
        <p className="listingLocation">{listing.location}</p>
        <p className="listingType">For {listing.type}</p>

        {listing.offer &&
          <p className="discountPrice">
            ${listing.regularPrice - listing.discountedPrice} discount
          </p>
        }

        <ul className="listingDetailsList">
          <li>
            {listing.mileage} km
          </li>
          <li>
            {listing.transmission} Transmission
          </li>
          {listing.hasInsurance &&
            <li className="listingDetailsList">
              Insurance Included
            </li>}
        </ul>
        <p className="listingLocation">Location</p>

        <div className="leafletContainer">
          <MapContainer
            style={{ height: '100%', width: '100%' }}
            center={[listing.latitude, listing.longitude]}
            zoom={13}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url='https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png'
            />

            <Marker position={[listing.latitude, listing.longitude]}>
              <Popup>{listing.location}</Popup>
            </Marker>
          </MapContainer>
        </div>

        {auth.currentUser?.uid !== listing.userRef && (
          <Link
            to={`/contact/${ listing.userRef }?listingName=${ listing.name }`}
            className='primaryButton'
          >
            Contact Seller
          </Link>
        )}
      </div>
    </main>
  );
}

export default Listing;
